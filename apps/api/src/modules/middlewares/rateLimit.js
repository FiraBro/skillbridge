import rateLimit from "express-rate-limit";

export const createPostLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
