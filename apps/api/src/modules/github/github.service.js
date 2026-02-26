import axios from "axios";
import crypto from "crypto";
import { env } from "../../config/env.js";
import githubRepo from "./github.repository.js";
import externalGitHubService from "../services/github.service.js";

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

  async connectGitHubAccount(code, userId) {
    console.log("=== CONNECT GITHUB ACCOUNT START ===");
    try {
      // Exchange code for token
      const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_CALLBACK_URL,
        },
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );

      const accessToken = tokenRes.data.access_token;
      if (!accessToken) throw new Error("GitHub access token missing");
      console.log("Access token received successfully");

      await this.validateToken(accessToken);
      console.log("Token validated successfully");

      // Fetch GitHub user profile
      let githubUser = null;
      try {
        const { data } = await axios.get("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "SkillBridge/1.0",
          },
        });
        githubUser = data;
      } catch (err) {
        console.error("GitHub user fetch failed:", err.message);
        throw new Error("GitHub service unavailable");
      }

      // Attach GitHub account to user
      await githubRepo.attachGitHubAccount({
        userId,
        githubId: githubUser.id,
        username: githubUser.login,
        avatar: githubUser.avatar_url,
      });
      console.log("GitHub account attached successfully");

      // Fetch enhanced stats safely
      let stats = {};
      try {
        stats = await externalGitHubService.fetchDeveloperStats(
          githubUser.login,
        );
      } catch (err) {
        console.warn(
          "Skipping enhanced stats due to GitHub API error:",
          err.message,
        );
      }

      // Fetch repositories safely
      let repos = [];
      try {
        repos = await this.fetchRepositories(accessToken, githubUser.login);
      } catch (err) {
        console.warn(
          "Skipping repositories due to GitHub API error:",
          err.message,
        );
      }

      // Save stats and repos (even if empty)
      await githubRepo.saveGitHubStats({
        userId,
        stats,
        avatar: githubUser.avatar_url,
      });
      await githubRepo.saveGitHubRepositories(userId, repos);

      console.log("=== CONNECT GITHUB ACCOUNT END ===");
    } catch (error) {
      console.error("GitHub account connection error:", error.message);
      throw error;
    }
  }

  async validateToken(accessToken) {
    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "SkillBridge/1.0",
        },
      });
      if (!response.data || !response.data.id)
        throw new Error("Invalid GitHub token");
      return true;
    } catch (error) {
      console.error("Token validation failed:", error.message);
      throw new Error("Invalid GitHub token provided");
    }
  }

  async syncGitHubData(userId) {
    console.log("Starting GitHub data sync for user:", userId);
    try {
      const profileResult = await githubRepo.getGitHubData(userId);
      if (!profileResult) throw new Error("GitHub profile not found for user");

      const githubUsername =
        profileResult.stats?.github_username || profileResult.stats?.username;
      if (!githubUsername)
        throw new Error("GitHub username not found for user");

      console.log("Syncing GitHub data for:", githubUsername);

      const stats =
        await externalGitHubService.fetchDeveloperStats(githubUsername);

      const enhancedStats = {
        ...stats,
        contributionStreak: await this.calculateContributionStreak(
          env.GITHUB_TOKEN,
          githubUsername,
        ),
        consistencyScore: this.calculateConsistencyScore(stats),
        weeklyActivity: await this.getWeeklyActivity(
          env.GITHUB_TOKEN,
          githubUsername,
        ),
        mostActiveDays: await this.getMostActiveDays(
          env.GITHUB_TOKEN,
          githubUsername,
        ),
      };

      const repositories = await this.fetchRepositories(
        env.GITHUB_TOKEN,
        githubUsername,
      );

      await githubRepo.saveGitHubStats({ userId, stats: enhancedStats });
      await githubRepo.saveGitHubRepositories(userId, repositories);

      console.log("GitHub data sync completed successfully");
    } catch (error) {
      console.error("Error in GitHub data sync:", error.message);
      throw error;
    }
  }

  async disconnectGitHubAccount(userId) {
    console.log("Disconnecting GitHub account for user:", userId);
    try {
      await githubRepo.detachGitHubAccount(userId);

      const profileResult = await githubRepo.getGitHubData(userId);
      if (profileResult) {
        const profileId = profileResult.stats?.profile_id;
        if (profileId) {
          await githubRepo.deleteGitHubStats(profileId);
          await githubRepo.deleteGitHubRepositories(profileId);
        }
      }

      console.log("GitHub account disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting GitHub account:", error.message);
      throw error;
    }
  }

  calculateAccountAgeInMonths(created_at) {
    const createdAt = new Date(created_at);
    const now = new Date();
    return Math.floor(Math.abs(now - createdAt) / (1000 * 60 * 60 * 24 * 30));
  }

  async calculateContributionStreak(token, username) {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/events`,
        {
          headers: {
            Authorization: `token ${token}`,
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );
      return Math.min(response.data.length, 365);
    } catch (error) {
      console.error("Error calculating contribution streak:", error.message);
      return 0;
    }
  }

  calculateConsistencyScore(stats) {
    const { commits30d, publicRepos, followers, totalStars } = stats;
    const commitScore = Math.min(commits30d / 30, 1);
    const repoScore = Math.min(publicRepos / 20, 1);
    const followerScore = Math.min(followers / 100, 1);
    const starScore = Math.min(totalStars / 100, 1);
    return parseFloat(
      (
        commitScore * 0.4 +
        repoScore * 0.2 +
        followerScore * 0.2 +
        starScore * 0.2
      ).toFixed(2),
    );
  }

  async getWeeklyActivity(token, username) {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/events`,
        {
          headers: {
            Authorization: `token ${token}`,
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );

      const weeklyActivity = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };
      const days = Object.keys(weeklyActivity);

      response.data.forEach((event) => {
        const day = days[new Date(event.created_at).getDay()];
        weeklyActivity[day] = (weeklyActivity[day] || 0) + 1;
      });

      return weeklyActivity;
    } catch (error) {
      console.error("Error getting weekly activity:", error.message);
      return {};
    }
  }

  async getMostActiveDays(token, username) {
    try {
      const weeklyActivity = await this.getWeeklyActivity(token, username);
      return Object.entries(weeklyActivity)
        .sort(([, a], [, b]) => b - a)
        .map(([day]) => ({ day, activity: weeklyActivity[day] }))
        .slice(0, 3);
    } catch (error) {
      console.error("Error getting most active days:", error.message);
      return [];
    }
  }

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
          language: repo.language,
          last_updated: repo.updated_at,
          is_public: !repo.private,
          is_fork: repo.fork,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          size: repo.size,
          default_branch: repo.default_branch,
        }))
        .filter((r) => !r.is_fork);
    } catch (error) {
      console.error("Error fetching repositories:", error.message);
      return [];
    }
  }
}

export default new GitHubOAuthService();
