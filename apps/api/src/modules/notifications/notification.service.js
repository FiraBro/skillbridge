import { query } from "../../config/db.js";

export async function recordProfileView(profileId, viewerId, viewerRole) {
  await query(
    `INSERT INTO profile_views (profile_id, viewer_id, viewer_role) VALUES ($1, $2, $3)`,
    [profileId, viewerId, viewerRole],
  );

  // EMAIL NOTIFICATION REMOVED: No longer sending email to dev when company views profile
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

  // EMAIL NOTIFICATION REMOVED: No longer sending email to receiver

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

  // EMAIL NOTIFICATION REMOVED: No longer notifying the company on acceptance

  return request;
}

export async function getUserNotifications(userId) {
  if (!userId) throw new Error("User ID is required");

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
