import { Queue } from "bullmq";

// Handle Upstash URL or local fallback
const redisConnection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

/**
 * githubQueue: The mailbox for all GitHub-related background tasks.
 */
export const githubQueue = new Queue("github-tasks", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
