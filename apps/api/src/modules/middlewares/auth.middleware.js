import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";

/**
 * Core authentication middleware:
 * Validates the token and attaches the user payload to req.user
 * Checks both Authorization header and cookies for JWT token
 */
export const requireAuth = (req, res, next) => {
  let token = null;

  // Check Authorization header first
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }
  // If not in header, check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ApiError(401, "Unauthorized: No token provided"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

/**
 * Role Authorization middleware:
 * Checks if the authenticated user has one of the allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized: Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: ${req.user.role} role does not have access`,
        ),
      );
    }

    next();
  };
};

/**
 * Optional authentication:
 * Decodes token if present, but doesn't block the request if missing/invalid
 */
export const optionalAuth = (req, res, next) => {
  let token = null;

  // Check Authorization header first
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }
  // If not in header, check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
  } catch (err) {
    // Fail silently for optional auth
  }
  next();
};
