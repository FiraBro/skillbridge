// apps/api/src/workers/github.worker.js
import { Worker } from "bullmq";
import { fetchGithubStats } from "../services/github.service.js";
import { query } from "../config/db.js";

const worker = new Worker(
  "github-tasks",
  async (job) => {
    if (job.name === "sync-developer-stats") {
      const { userId, githubUsername, accessToken } = job.data;

      // Fetch deep data from GitHub API
      const stats = await fetchGithubStats(githubUsername, accessToken);

      // Cache the data in our PostgreSQL "profiles" or "users" table
      await query(
        `UPDATE users 
       SET github_stats = $1, 
           reputation_score = $2 
       WHERE id = $3`,
        [JSON.stringify(stats), stats.total_stars * 10, userId],
      );
    }
  },
  { connection: redisConfig },
);
