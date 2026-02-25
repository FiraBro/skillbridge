import { Worker } from "bullmq";
import Redis from "ioredis";
import { fetchGithubStats } from "../services/github.service.js";
import { query } from "../config/db.js";

// Connection logic for Upstash/Render
const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({ host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null });

const worker = new Worker(
  "github-tasks",
  async (job) => {
    if (job.name === "sync-developer-stats") {
      const { userId, githubUsername, accessToken } = job.data;

      const stats = await fetchGithubStats(githubUsername, accessToken);

      await query(
        `UPDATE users 
       SET github_stats = $1, 
           reputation_score = $2 
       WHERE id = $3`,
        [JSON.stringify(stats), stats.total_stars * 10, userId],
      );
    }
  },
  { connection }, // Using the fixed connection
);

worker.on("failed", (job, err) => {
  console.error(`GitHub sync ${job.id} failed: ${err.message}`);
});
