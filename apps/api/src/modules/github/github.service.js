import axios from "axios";
import crypto from "crypto";
import { env } from "../../config/env.js";
import githubRepo from "./github.repository.js";

class GitHubOAuthService {
  constructor() {
    this.encryptionKey = crypto.scryptSync(
      env.GITHUB_ENCRYPTION_KEY || "default-key-for-development",
      "salt",
      32,
    );
  }

  encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.encryptionKey, iv);
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { encryptedData: encrypted, iv: iv.toString("hex") };
  }

  decryptToken(encryptedData, iv) {
    const ivBuffer = Buffer.from(iv, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.encryptionKey,
      ivBuffer,
    );
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  async validateToken(accessToken) {
    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "SkillBridge/1.0",
        },
      });
      if (!response.data?.id) throw new Error("Invalid GitHub token");
      return true;
    } catch (error) {
      console.error("Token validation failed:", error.message);
      throw new Error("Invalid GitHub token provided");
    }
  }

  async connectGitHubAccount(code, userId) {
    console.log("=== CONNECT GITHUB ACCOUNT START ===");

    try {
      // 1. Exchange code for access token
      const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_CALLBACK_URL,
        },
        { headers: { Accept: "application/json" } },
      );

      const accessToken = tokenRes.data.access_token;
      if (!accessToken) throw new Error("GitHub access token missing");

      // 2. Validate token
      await this.validateToken(accessToken);

      // 3. Fetch GitHub user profile
      const { data: githubUser } = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );

      // 4. Attach GitHub account to user (store githubId and username)
      await githubRepo.attachGitHubAccount({
        userId,
        githubId: githubUser.id,
        username: githubUser.login,
      });

      // 5. Fetch repositories (excluding forks)
      const repositories = await this.fetchRepositories(
        accessToken,
        githubUser.login,
      );

      // 6. Fetch 30-day commit count across all repos
      const commits30d = await this.fetchCommitsLast30Days(
        accessToken,
        githubUser.login,
        repositories,
      );

      // 7. Fetch total pull requests authored by the user
      const pullRequests = await this.fetchPullRequestCount(
        accessToken,
        githubUser.login,
      );

      // 8. Compute stats – only the fields you requested
      const stats = {
        username: githubUser.login,
        followers: githubUser.followers || 0,
        publicRepos: repositories.length,
        totalStars: repositories.reduce(
          (sum, repo) => sum + (repo.stars || 0),
          0,
        ),
        commits30d,
        pullRequests,
        // Optional: keep account age if your app needs it
        accountAgeMonths: Math.floor(
          (Date.now() - new Date(githubUser.created_at)) /
            (1000 * 60 * 60 * 24 * 30),
        ),
      };

      // 9. Save everything atomically
      await githubRepo.saveGitHubDataAtomic({
        userId,
        stats,
        repositories,
      });

      console.log("GitHub account connected and data saved successfully ✅");
    } catch (err) {
      console.error("GitHub account connection error:", err.message);
      throw err;
    }
  }

  /**
   * Fetch all repositories for the user (max 100, sorted by updated).
   * Forks are excluded.
   */
  async fetchRepositories(token, username) {
    try {
      const { data } = await axios.get(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            Authorization: `token ${token}`,
            "User-Agent": "SkillBridge/1.0",
          },
          params: { type: "all", sort: "updated", per_page: 100 },
        },
      );

      return data
        .map((repo) => ({
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language, // kept but not used in stats
          last_updated: repo.updated_at,
          is_public: !repo.private,
          is_fork: repo.fork,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          size: repo.size,
          default_branch: repo.default_branch,
        }))
        .filter((r) => !r.is_fork); // exclude forks as requested
    } catch (error) {
      console.error("Fetch repositories error:", error.message);
      return [];
    }
  }

  /**
   * Count commits made in the last 30 days across all repositories.
   * For each repo, we request up to 100 commits (enough for a reliable estimate).
   */
  async fetchCommitsLast30Days(token, username, repositories) {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceISO = since.toISOString();

    let totalCommits = 0;

    for (const repo of repositories) {
      try {
        const { data: commits } = await axios.get(
          `https://api.github.com/repos/${username}/${repo.name}/commits`,
          {
            headers: {
              Authorization: `token ${token}`,
              "User-Agent": "SkillBridge/1.0",
            },
            params: {
              since: sinceISO,
              per_page: 100,
            },
          },
        );
        totalCommits += commits.length;
      } catch (error) {
        // Repo might be empty or have no commits – skip silently
        console.log(
          `Could not fetch commits for ${repo.name}: ${error.message}`,
        );
      }
    }

    return totalCommits;
  }

  /**
   * Get total number of pull requests authored by the user (any state, any repo).
   * Uses the GitHub Search API, which returns the total count efficiently.
   */
  async fetchPullRequestCount(token, username) {
    try {
      const { data } = await axios.get("https://api.github.com/search/issues", {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "SkillBridge/1.0",
        },
        params: {
          q: `author:${username} type:pr`,
          per_page: 1, // we only need total_count
        },
      });
      return data.total_count || 0;
    } catch (error) {
      console.error("Failed to fetch pull request count:", error.message);
      return 0;
    }
  }

  async disconnectGitHubAccount(userId) {
    console.log("Disconnecting GitHub account for user:", userId);
    try {
      await githubRepo.disconnectGitHubAccount(userId);
      console.log("GitHub account disconnected successfully");
      return { success: true };
    } catch (error) {
      console.error("Error disconnecting GitHub account:", error);
      throw error;
    }
  }
}

export default new GitHubOAuthService();
