import { Queue } from "bullmq";

// Upstash uses a full URL (rediss://...), so we check for REDIS_URL first
const redisConnection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

export const emailQueue = new Queue("email-tasks", {
  connection: redisConnection,
});
