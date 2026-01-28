import { pool } from "../../config/db.js";
import ApiError from "../utils/apiError.js";

export const ownershipMiddleware = () => {
  return async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user.id;

    console.log("DEBUG postId:", postId);
    console.log("DEBUG req.user:", req.user);

    const { rows } = await pool.query(
      `SELECT id, author_id FROM posts WHERE id=$1`,
      [postId],
    );

    console.log("DEBUG db row:", rows[0]);

    if (!rows.length) {
      throw new ApiError(404, "Post not found");
    }

    const ownerId = rows[0].author_id;

    console.log("DEBUG ownerId:", ownerId, " userId:", userId);

    if (String(ownerId) !== String(userId)) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  };
};
