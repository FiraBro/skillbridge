import crypto from "crypto";
import { redis } from "../../config/redis.js";
import { pool } from "../../config/db.js";

export async function trackView(req, postId) {
  const fp = crypto
    .createHash("sha256")
    .update(req.ip + req.headers["user-agent"])
    .digest("hex");

  const key = `view:${postId}:${fp}`;
  if (await redis.get(key)) return;

  await redis.set(key, "1", "EX", 86400);
  await pool.query("UPDATE posts SET views = views + 1 WHERE id=$1", [postId]);
}
