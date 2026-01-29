import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // ⚡ Map sub to id
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid token");
  }
};

export const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
  } catch (err) {
    // Ignore invalid token or expiration in optional auth
  }

  next();
};
