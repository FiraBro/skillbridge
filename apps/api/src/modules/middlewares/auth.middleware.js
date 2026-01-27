import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401);
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // ⚡ Map sub to id
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    throw new ApiError("Invalid token", 401);
  }
};
