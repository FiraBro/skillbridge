import pkg from "pg";
import { env } from "./env.js";

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err);
  process.exit(1);
});

export const query = (text, params) => pool.query(text, params);
