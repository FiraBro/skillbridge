import { Queue } from "bullmq";

// Use the full Upstash URL if available, otherwise fallback to local object
const redisConnection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

export const emailQueue = new Queue("email-tasks", {
  connection: redisConnection,
});
