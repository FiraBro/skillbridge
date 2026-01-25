import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401); // ✅ message first, statusCode second
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    throw new ApiError("Invalid token", 401); // ✅ correct order
  }
};
