import { pool } from "../../config/db.js";
class GitHubRepository {
  async attachGitHubAccount({ userId, githubId, username, avatar }) {
    await pool.query(
      `
      UPDATE users
      SET github_id = $1,
          github_username = $2,
          github_verified = true,
          github_connected_at = NOW()
      WHERE id = $3
      `,
      [githubId, username, userId],
    );
  }

  async saveGitHubStats({ userId, stats, avatar }) {
    await pool.query(
      `
      UPDATE profiles
      SET github_stats = $1,
          github_avatar = $2
      WHERE user_id = $3
      `,
      [stats, avatar, userId],
    );
  }
}

export default new GitHubRepository();
