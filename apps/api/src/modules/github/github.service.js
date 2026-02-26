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
      const { data: githubUser } = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );

      // Attach GitHub account to user
      await githubRepo.attachGitHubAccount({
        userId,
        githubId: githubUser.id,
        username: githubUser.login,
        avatar: githubUser.avatar_url,
      });
      console.log("GitHub account attached successfully");

      // Fetch enhanced stats
      const stats = await this.fetchEnhancedStats(
        accessToken,
        githubUser.login,
      );

      // Fetch repositories
      const repos = await this.fetchRepositories(accessToken, githubUser.login);

      // Save stats and repos
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
      if (!response.data?.id) throw new Error("Invalid GitHub token");
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

      const stats = await this.fetchEnhancedStats(
        env.GITHUB_TOKEN,
        githubUsername,
      );
      const repositories = await this.fetchRepositories(
        env.GITHUB_TOKEN,
        githubUsername,
      );

      await githubRepo.saveGitHubStats({ userId, stats });
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

  async fetchEnhancedStats(token, username) {
    try {
      const repos = await this.fetchRepositories(token, username);
      const totalStars = repos.reduce((acc, r) => acc + (r.stars || 0), 0);
      const publicRepos = repos.filter((r) => r.is_public).length;
      const commits30d = await this.fetchCommitsLast30Days(token, username);
      const pullRequests = await this.fetchPullRequests(token, username);

      return { totalStars, publicRepos, commits30d, pullRequests };
    } catch (err) {
      console.error("Error fetching enhanced stats:", err.message);
      return { totalStars: 0, publicRepos: 0, commits30d: 0, pullRequests: 0 };
    }
  }

  async fetchCommitsLast30Days(token, username) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await axios.get(
        `https://api.github.com/users/${username}/events`,
        {
          headers: {
            Authorization: `token ${token}`,
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );

      return response.data
        .filter(
          (e) =>
            e.type === "PushEvent" && new Date(e.created_at) >= thirtyDaysAgo,
        )
        .reduce((acc, e) => acc + e.payload.commits.length, 0);
    } catch (err) {
      console.error("Error fetching commits last 30 days:", err.message);
      return 0;
    }
  }

  async fetchPullRequests(token, username) {
    try {
      const response = await axios.get(`https://api.github.com/search/issues`, {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "SkillBridge/1.0",
        },
        params: { q: `type:pr+author:${username}`, per_page: 100 },
      });
      return response.data.total_count || 0;
    } catch (err) {
      console.error("Error fetching pull requests:", err.message);
      return 0;
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
