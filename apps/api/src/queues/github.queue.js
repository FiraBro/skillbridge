// apps/api/src/queues/github.queue.js
import { Queue } from "bullmq";

// Connection details for your Redis instance
const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  // If your Redis has a password:
  // password: process.env.REDIS_PASSWORD
};

/**
 * githubQueue: The mailbox for all GitHub-related background tasks.
 * This instance is used by the API to "produce" jobs.
 */
export const githubQueue = new Queue("github-tasks", {
  connection: redisConnection,
  defaultJobOptions: {
    // Real world: don't let failed jobs clog up Redis forever
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    // Exponential backoff: Wait 1s, then 2s, then 4s if it fails
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
