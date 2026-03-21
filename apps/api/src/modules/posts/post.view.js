import crypto from "crypto";
import { pool } from "../../config/db.js";
export async function trackView(req, postId, authorId) {
  if (req.user && req.user.id === authorId) return;

  const fp = crypto
    .createHash("sha256")
    .update(req.ip + req.headers["user-agent"])
    .digest("hex");

  try {
    // Attempt to insert the view record
    await pool.query(
      "INSERT INTO post_views (post_id, fingerprint) VALUES ($1, $2)",
      [postId, fp],
    );

    // If the insert succeeds, increment the main count
    await pool.query("UPDATE posts SET views = views + 1 WHERE id=$1", [
      postId,
    ]);
  } catch (err) {
    // If it fails (code 23505 is Unique Violation), they already viewed it today.
    if (err.code !== "23505") throw err;
  }
}
