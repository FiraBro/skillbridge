import { query } from "../../config/db.js";
import { emailQueue } from "../../queues/email.queue.js";

export async function recordProfileView(profileId, viewerId, viewerRole) {
  await query(
    `INSERT INTO profile_views (profile_id, viewer_id, viewer_role) VALUES ($1, $2, $3)`,
    [profileId, viewerId, viewerRole],
  );

  if (viewerRole === "company") {
    const { rows } = await query(
      `SELECT u.email, u.name as dev_name, v.name as company_name
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN users v ON v.id = $2
       WHERE p.id = $1`,
      [profileId, viewerId],
    );

    const data = rows[0];
    if (data?.email) {
      await emailQueue.add("send-profile-view-notification", {
        to: data.email,
        devName: data.dev_name,
        companyName: data.company_name || "A potential employer",
      });
    }
  }
}

export async function sendContactRequest(senderId, receiverId, message) {
  const { rows } = await query(
    `INSERT INTO contact_requests (sender_id, receiver_id, message)
     VALUES ($1, $2, $3)
     ON CONFLICT (sender_id, receiver_id) DO NOTHING
     RETURNING *`,
    [senderId, receiverId, message],
  );

  if (rows.length === 0) throw new Error("Contact request already sent");

  const { rows: userRows } = await query(
    `SELECT u.email, u.name as receiver_name, s.name as sender_name
     FROM users u
     JOIN users s ON s.id = $1
     WHERE u.id = $2`,
    [senderId, receiverId],
  );

  const data = userRows[0];
  if (data) {
    await emailQueue.add("send-contact-request-notification", {
      to: data.email,
      receiverName: data.receiver_name,
      senderName: data.sender_name,
      message: message,
    });
  }
  return rows[0];
}

export async function updateRequestStatus(requestId, userId, status) {
  if (!["accepted", "ignored"].includes(status)) {
    throw new Error("Invalid status update");
  }

  const { rows } = await query(
    `UPDATE contact_requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND receiver_id = $3
     RETURNING *`,
    [status, requestId, userId],
  );

  if (rows.length === 0) throw new Error("Request not found");

  const request = rows[0];

  // Logic: Only notify the company if the developer ACCEPTED
  if (status === "accepted") {
    const { rows: actorRows } = await query(
      `SELECT s.email as company_email, s.name as company_name, r.name as dev_name
       FROM users s
       JOIN users r ON r.id = $2
       WHERE s.id = $1`,
      [request.sender_id, userId],
    );

    const emailData = actorRows[0];
    if (emailData) {
      await emailQueue.add("send-request-accepted-notification", {
        to: emailData.company_email,
        companyName: emailData.company_name,
        devName: emailData.dev_name,
      });
    }
  }
  return request;
}

export async function getUserNotifications(userId) {
  if (!userId) throw new Error("User ID is required");

  // FIX: Explicitly cast 'type' to ensure UNION compatibility in some Postgres versions
  const combinedQuery = `
    SELECT 
      'profile_view'::text as type,
      v.id,
      v.created_at,
      COALESCE(u.name, 'Someone') as actor_name,
      NULL as message,
      NULL as status
    FROM profile_views v
    JOIN profiles p ON p.id = v.profile_id
    LEFT JOIN users u ON u.id = v.viewer_id
    WHERE p.user_id = $1 AND v.viewer_role = 'company'

    UNION ALL

    SELECT 
      'contact_request'::text as type,
      cr.id,
      cr.created_at,
      COALESCE(us.name, 'Unknown User') as actor_name,
      cr.message,
      cr.status
    FROM contact_requests cr
    LEFT JOIN users us ON us.id = cr.sender_id
    WHERE cr.receiver_id = $1

    UNION ALL

    -- This handles the Company seeing that their sent request was accepted
    SELECT 
      'request_accepted'::text as type,
      cr.id,
      cr.updated_at as created_at,
      COALESCE(ur.name, 'Developer') as actor_name,
      'accepted your contact request' as message,
      cr.status
    FROM contact_requests cr
    LEFT JOIN users ur ON ur.id = cr.receiver_id
    WHERE cr.sender_id = $1 AND cr.status = 'accepted'

    ORDER BY created_at DESC
  `;

  const { rows } = await query(combinedQuery, [userId]);
  return rows || [];
}
