import crypto from "crypto";
import { redis } from "../../config/redis.js";
import { pool } from "../../config/db.js";

export async function trackView(req, postId, authorId) {
  // 1. If the user is logged in AND they are the author, exit early.
  // req.user.id usually comes from your auth middleware
  if (req.user && req.user.id === authorId) {
    return;
  }

  const fp = crypto
    .createHash("sha256")
    .update(req.ip + req.headers["user-agent"])
    .digest("hex");

  const key = `view:${postId}:${fp}`;

  // 2. Check Redis to see if this specific person viewed this post today
  if (await redis.get(key)) return;

  // 3. Set the "Already Viewed" flag for 24 hours
  await redis.set(key, "1", "EX", 86400);

  // 4. Update the database
  await pool.query("UPDATE posts SET views = views + 1 WHERE id=$1", [postId]);
}
