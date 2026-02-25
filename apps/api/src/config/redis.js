import Redis from "ioredis";
import { env } from "./env.js";

// 1. Create the instance
export const redis = new Redis(env.REDIS_URL || "redis://127.0.0.1:6379", {
  // Add this to prevent BullMQ/Redis from hanging during a reconnect
  maxRetriesPerRequest: null,
  // Add this to ensure TLS works for Upstash
  tls: env.REDIS_URL?.startsWith("rediss://")
    ? { rejectUnauthorized: false }
    : undefined,
});

// 2. THE CRITICAL PART: Add the error listener
redis.on("error", (err) => {
  if (err.code === "ECONNREFUSED") {
    console.warn("⚠️ Redis connection refused at", err.address, ":", err.port);
    // The server will now stay ALIVE instead of crashing
  } else {
    console.error("❌ Redis Error:", err);
  }
});

redis.on("connect", () => {
  console.log("✅ Successfully connected to Redis/Upstash");
});
