import Redis from "ioredis";
import { env } from "./env.js";

const commonConfig = {
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  tls: env.REDIS_URL?.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
  reconnectOnError(err) {
    if (err.message.includes("READONLY") || err.code === "ECONNRESET") {
      return true;
    }
    return false;
  },
};

// 1. Connection for General Cache / Auth (Fails after 3 tries)
export const redis = new Redis(env.REDIS_URL, {
  ...commonConfig,
  maxRetriesPerRequest: 3,
});

// 2. Connection for BullMQ (Required to be NULL)
export const queueConnection = new Redis(env.REDIS_URL, {
  ...commonConfig,
  maxRetriesPerRequest: null,
});
