import { Queue } from "bullmq";

// Connection details for Redis (Real world: use environment variables)
const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

export const emailQueue = new Queue("email-tasks", {
  connection: redisConnection,
});
