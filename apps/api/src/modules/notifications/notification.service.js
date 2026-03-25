import { query } from "../../config/db.js";

export async function getUserNotifications(userId) {
  const combinedQuery = `
    SELECT 'profile_view'::text as type, v.id, v.created_at, u.name as actor_name, NULL as message
    FROM profile_views v
    JOIN profiles p ON p.id = v.profile_id
    LEFT JOIN users u ON u.id = v.viewer_id
    WHERE p.user_id = $1 AND v.viewer_role = 'company'
    UNION ALL
    SELECT 'new_message'::text as type, m.id, m.created_at, u.name as actor_name, m.message_text as message
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id IN (SELECT id FROM conversations WHERE user_one = $1 OR user_two = $1)
    AND m.sender_id != $1
    ORDER BY created_at DESC;
  `;
  const { rows } = await query(combinedQuery, [userId]);
  return rows || [];
}

export async function getOrCreateConversation(userA, userB) {
  const { rows } = await query(
    `INSERT INTO conversations (user_one, user_two)
     VALUES (LEAST($1, $2), GREATEST($1, $2))
     ON CONFLICT (user_one, user_two) DO UPDATE SET last_message_at = NOW()
     RETURNING id`,
    [userA, userB],
  );
  return rows[0].id;
}

export async function sendMessage(senderId, receiverId, messageText) {
  const conversationId = await getOrCreateConversation(senderId, receiverId);
  const { rows } = await query(
    `INSERT INTO messages (conversation_id, sender_id, message_text)
     VALUES ($1, $2, $3) RETURNING *`,
    [conversationId, senderId, messageText],
  );
  return rows[0];
}

export async function getChatHistory(userA, userB) {
  const { rows } = await query(
    `SELECT m.*, u.name as sender_name FROM messages m
     JOIN conversations c ON m.conversation_id = c.id
     JOIN users u ON m.sender_id = u.id
     WHERE (c.user_one = LEAST($1, $2) AND c.user_two = GREATEST($1, $2))
     ORDER BY m.created_at ASC`,
    [userA, userB],
  );
  return rows;
}

export async function getUserInbox(userId) {
  const { rows } = await query(
    `SELECT c.id as conversation_id, u.name as partner_name, 
     (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
     FROM conversations c
     JOIN users u ON (u.id = c.user_one OR u.id = c.user_two)
     WHERE (c.user_one = $1 OR c.user_two = $1) AND u.id != $1`,
    [userId],
  );
  return rows;
}

// Added this back in case you still have old requests in your DB
export async function updateRequestStatus(requestId, userId, status) {
  const { rows } = await query(
    `UPDATE contact_requests SET status = $1 WHERE id = $2 AND receiver_id = $3 RETURNING *`,
    [status, requestId, userId],
  );
  return rows[0];
}
