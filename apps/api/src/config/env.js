import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,

  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
  JWT_RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN || "15m",

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS || 12),

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || "http://localhost:6000/api/github/auth/github/callback",

  GITHUB_TOKEN:
    process.env.GITHUB_TOKEN || "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",
};
