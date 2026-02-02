import { query } from "../../config/db.js";
import { emailQueue } from "../../queues/email.queue.js";

/**
 * Record a profile view and trigger notification if viewer is a company
 */
export async function recordProfileView(profileId, viewerId, viewerRole) {
  // 1. Record the view in DB
  await query(
    `INSERT INTO profile_views (profile_id, viewer_id, viewer_role) VALUES ($1, $2, $3)`,
    [profileId, viewerId, viewerRole],
  );

  // 2. If viewer is a company, notify the developer
  if (viewerRole === "company") {
    const { rows } = await query(
      `
      SELECT u.email, u.name as dev_name, v.name as company_name
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN users v ON v.id = $2
      WHERE p.id = $1
      `,
      [profileId, viewerId],
    );

    const data = rows[0];
    if (data && data.email) {
      await emailQueue.add("send-profile-view-notification", {
        to: data.email,
        devName: data.dev_name,
        companyName: data.company_name || "A potential employer",
      });
    }
  }
}

/**
 * Send a professional contact request
 */
export async function sendContactRequest(senderId, receiverId, message) {
  const { rows } = await query(
    `
    INSERT INTO contact_requests (sender_id, receiver_id, message)
    VALUES ($1, $2, $3)
    ON CONFLICT (sender_id, receiver_id) DO NOTHING
    RETURNING *
    `,
    [senderId, receiverId, message],
  );

  if (rows.length === 0) {
    throw new Error("Contact request already sent");
  }

  // Notify receiver via email
  const { rows: userRows } = await query(
    `
    SELECT u.email, u.name as receiver_name, s.name as sender_name
    FROM users u
    JOIN users s ON s.id = $1
    WHERE u.id = $2
    `,
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

/**
 * Update status of a contact request (Accept/Ignore)
 */
export async function updateRequestStatus(requestId, userId, status) {
  if (!["accepted", "ignored"].includes(status)) {
    throw new Error("Invalid status update");
  }

  const { rows } = await query(
    `
    UPDATE contact_requests
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND receiver_id = $3
    RETURNING *
    `,
    [status, requestId, userId],
  );

  if (rows.length === 0) {
    throw new Error("Request not found or unauthorized");
  }

  return rows[0];
}

/**
 * Get user's active notifications (views and requests)
 */
/**
 * Get user's active notifications (views and requests)
 */
export async function getUserNotifications(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // We use UNION ALL to get everything in one database trip
    // We also use COALESCE to ensure actor_name is never undefined
    const combinedQuery = `
      SELECT 
        'profile_view' as type,
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
        'contact_request' as type,
        cr.id,
        cr.created_at,
        COALESCE(us.name, 'Unknown User') as actor_name,
        cr.message,
        cr.status
      FROM contact_requests cr
      LEFT JOIN users us ON us.id = cr.sender_id
      WHERE cr.receiver_id = $1

      ORDER BY created_at DESC
    `;

    const { rows } = await query(combinedQuery, [userId]);
    
    // Safety check: ensure we always return an array
    return rows || [];
  } catch (error) {
    console.error("Database Error in getUserNotifications:", error.message);
    throw error;
  }
}
