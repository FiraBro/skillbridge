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

  // async connectGitHubAccount(code, userId) {
  //   console.log("=== CONNECT GITHUB ACCOUNT START ===");
  //   try {
  //     // 1️⃣ Exchange code for access token
  //     const tokenRes = await axios.post(
  //       "https://github.com/login/oauth/access_token",
  //       {
  //         client_id: env.GITHUB_CLIENT_ID,
  //         client_secret: env.GITHUB_CLIENT_SECRET,
  //         code,
  //         redirect_uri: env.GITHUB_CALLBACK_URL,
  //       },
  //       {
  //         headers: {
  //           Accept: "application/json",
  //           "User-Agent": "SkillBridge/1.0",
  //         },
  //       },
  //     );

  //     const accessToken = tokenRes.data.access_token;
  //     if (!accessToken) throw new Error("GitHub access token missing");
  //     console.log("Access token received successfully");

  //     // 2️⃣ Validate token
  //     await this.validateToken(accessToken);
  //     console.log("Token validated successfully");

  //     // 3️⃣ Fetch GitHub user profile
  //     const { data: githubUser } = await axios.get(
  //       "https://api.github.com/user",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "User-Agent": "SkillBridge/1.0",
  //         },
  //       },
  //     );

  //     // 4️⃣ Attach GitHub account to user
  //     await githubRepo.attachGitHubAccount({
  //       userId,
  //       githubId: githubUser.id,
  //       username: githubUser.login,
  //       avatar: githubUser.avatar_url,
  //     });
  //     console.log("GitHub account attached successfully");

  //     // 5️⃣ Fetch enhanced stats safely
  //     const stats = await this.fetchEnhancedStatsSafe(
  //       accessToken,
  //       githubUser.login,
  //     );

  //     // 6️⃣ Fetch repositories safely
  //     let repos = [];
  //     try {
  //       repos = await this.fetchRepositories(accessToken, githubUser.login);
  //     } catch (err) {
  //       console.warn(
  //         "Skipping repositories due to GitHub API error:",
  //         err.message,
  //       );
  //     }

  //     // 7️⃣ Save stats and repos — use userId (not profileId)
  //     await githubRepo.saveGitHubStats({ userId, stats });
  //     await githubRepo.saveGitHubRepositories(userId, repos);

  //     console.log("=== CONNECT GITHUB ACCOUNT END ===");
  //   } catch (error) {
  //     console.error("GitHub account connection error:", error.message);
  //     throw error;
  //   }
  // }

  // CONNECT GITHUB ACCOUNT (FIXED)
  // ========================================================= */
  async connectGitHubAccount(code, userId) {
    console.log("=== CONNECT GITHUB ACCOUNT START ===");

    try {
      // 1️⃣ Exchange code for access token
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

      // 2️⃣ Validate token
      await this.validateToken(accessToken);

      // 3️⃣ Fetch GitHub user profile
      const { data: githubUser } = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "SkillBridge/1.0",
          },
        },
      );

      // 4️⃣ Attach GitHub account to user
      await githubRepo.attachGitHubAccount({
        userId,
        githubId: githubUser.id,
        username: githubUser.login,
      });

      // 5️⃣ Fetch repositories
      const repositories = await this.fetchRepositories(
        accessToken,
        githubUser.login,
      );

      // 6️⃣ Compute stats from repos
      const stats = this.computeStatsFromRepos(githubUser, repositories);

      // 7️⃣ Save everything atomically
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
  computeStatsFromRepos(githubUser, repositories) {
    let totalStars = 0;
    let commits30d = 0; // optional; needs separate API if you want exact numbers
    const languageCount = {};

    repositories.forEach((repo) => {
      totalStars += repo.stars || 0;
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    return {
      publicRepos: repositories.length,
      followers: githubUser.followers || 0,
      githubFollowing: githubUser.following || 0,
      githubBio: githubUser.bio || "",
      totalStars,
      totalCommits: commits30d,
      commits30d,
      topLanguages,
      contributionStreak: 0, // can calculate via events API if needed
      consistencyScore: Math.min(1, repositories.length / 20), // example metric
      verificationStatus: "verified",
      accountAgeMonths: Math.floor(
        (Date.now() - new Date(githubUser.created_at)) /
          (1000 * 60 * 60 * 24 * 30),
      ),
    };
  }
  async fetchEnhancedStatsSafe(token, githubUser, repositories) {
    let totalStars = 0;
    let totalCommits30d = 0;
    const languageMap = {};

    // ⭐ Count stars & languages
    for (const repo of repositories) {
      totalStars += repo.stars || 0;

      if (repo.language) {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
      }

      // 🧮 Fetch commits (last 30 days)
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);

        const res = await axios.get(
          `https://api.github.com/repos/${githubUser.login}/${repo.name}/commits`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { since: since.toISOString(), per_page: 100 },
          },
        );

        totalCommits30d += res.data.length;
      } catch {
        // ignore repos without commits or permissions
      }
    }

    const topLanguages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      publicRepos: repositories.length,
      followers: githubUser.followers || 0,
      githubFollowing: githubUser.following || 0,
      githubBio: githubUser.bio || "",
      totalStars,
      commits30d: totalCommits30d,
      totalCommits: totalCommits30d, // lifetime optional later
      topLanguages,
      consistencyScore: Math.min(100, totalCommits30d * 2),
      verificationStatus: "verified",
      accountAgeMonths: Math.floor(
        (Date.now() - new Date(githubUser.created_at)) /
          (1000 * 60 * 60 * 24 * 30),
      ),
    };
  }

  calculateTopLanguages(repos) {
    const langMap = {};
    repos.forEach((repo) => {
      if (repo.language)
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    });
    return Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => lang)
      .slice(0, 5);
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
      if (!profileResult) throw new Error("GitHub profile not found");

      const githubUsername = profileResult.stats?.github_username;
      if (!githubUsername) throw new Error("GitHub username not found");

      const stats = await this.fetchEnhancedStatsSafe(
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
      console.error("GitHub data sync error:", error.message);
      throw error;
    }
  }

  // github.service.js

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
      console.error("Contribution streak error:", error.message);
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
      console.error("Weekly activity error:", error.message);
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
      console.error("Most active days error:", error.message);
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
      console.error("Fetch repositories error:", error.message);
      return [];
    }
  }
}

export default new GitHubOAuthService();
