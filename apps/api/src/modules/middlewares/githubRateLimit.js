import rateLimit from "express-rate-limit";

// Rate limiter for GitHub-related endpoints
export const githubRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many GitHub requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More restrictive rate limiter for sync operations
export const githubSyncRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each user to 5 sync operations per hour
  message: {
    error: "Too many GitHub sync requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for OAuth endpoints
export const githubOAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 OAuth attempts per windowMs
  message: {
    error: "Too many GitHub OAuth attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});