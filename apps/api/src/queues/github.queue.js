import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    });

export const githubQueue = new Queue("github-tasks", {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
