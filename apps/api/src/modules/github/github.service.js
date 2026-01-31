import axios from "axios";
import crypto from 'crypto';
import { env } from "../../config/env.js";
import githubRepo from "./github.repository.js";
import externalGitHubService from "../services/github.service.js";

class GitHubOAuthService {
  constructor() {
    // Use environment variable for encryption key, or generate one if not provided
    this.encryptionKey = crypto.scryptSync(env.GITHUB_ENCRYPTION_KEY || 'default-key-for-development', 'salt', 32);
  }

  /**
   * Encrypts the GitHub access token before storing
   */
  encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypts the stored GitHub access token
   */
  decryptToken(encryptedData, iv) {
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, ivBuffer);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async connectGitHubAccount(code, userId) {
    console.log('=== CONNECT GITHUB ACCOUNT START ===');
    console.log('Starting GitHub account connection for user:', userId);
    console.log('Received code:', code ? '***HIDDEN***' : 'MISSING');

    try {
      // 1. Exchange code for token
      console.log('Exchanging code for token...');
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
            'User-Agent': 'SkillBridge/1.0' // Follow GitHub API guidelines
          },
        }
      );

      console.log('Token exchange response status:', tokenRes.status);
      console.log('Token exchange response data keys:', Object.keys(tokenRes.data));

      const accessToken = tokenRes.data.access_token;
      if (!accessToken) {
        console.error('Access token missing in response:', tokenRes.data);
        throw new Error("GitHub token missing");
      }

      console.log('Access token received successfully');

      // Validate token before proceeding
      await this.validateToken(accessToken);
      console.log('Token validated successfully');

      // 2. Fetch GitHub identity
      console.log('Fetching GitHub user data...');
      const { data: githubUser } = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'SkillBridge/1.0'
          },
        },
      );

      const { id, login, avatar_url, bio, followers, following, created_at } = githubUser;
      console.log('GitHub user data fetched:', { id, login, avatar_url });

      // 3. Persist identity (ownership proof)
      console.log('Attaching GitHub account to user:', userId);
      await githubRepo.attachGitHubAccount({
        userId,
        githubId: id,
        username: login,
        avatar: avatar_url,
      });
      console.log('GitHub account attached to user successfully');

      // 4. Fetch & cache enhanced stats and repositories
      console.log('Fetching enhanced GitHub data for:', login);

      // Get detailed stats
      const stats = await externalGitHubService.fetchDeveloperStats(login);
      console.log('Basic stats fetched');

      // Enhance stats with additional data
      const enhancedStats = {
        ...stats,
        githubBio: bio,
        githubFollowing: following,
        accountAgeMonths: this.calculateAccountAgeInMonths(created_at),
        contributionStreak: await this.calculateContributionStreak(accessToken, login),
        consistencyScore: this.calculateConsistencyScore(stats),
        weeklyActivity: await this.getWeeklyActivity(accessToken, login),
        mostActiveDays: await this.getMostActiveDays(accessToken, login),
        verificationStatus: 'verified'
      };
      console.log('Enhanced stats calculated');

      // Get repositories
      const repositories = await this.fetchRepositories(accessToken, login);
      console.log('Repositories fetched:', repositories.length);

      console.log('Saving GitHub stats for user:', userId);
      await githubRepo.saveGitHubStats({
        userId,
        stats: enhancedStats,
        avatar: avatar_url,
      });
      console.log('GitHub stats saved successfully');

      console.log('Saving GitHub repositories for user:', userId);
      await githubRepo.saveGitHubRepositories(userId, repositories);
      console.log('GitHub repositories saved successfully');

      console.log('GitHub account connection completed successfully');
      console.log('=== CONNECT GITHUB ACCOUNT END ===');
    } catch (error) {
      console.error('=== ERROR IN GITHUB ACCOUNT CONNECTION ===');
      console.error('Error in GitHub account connection:', error.message);
      console.error('Stack trace:', error.stack);
      if (error.response) {
        console.error('GitHub API error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: Object.keys(error.response.headers)
        });
      }
      console.error('=== END ERROR DETAILS ===');
      throw error;
    }
  }

  /**
   * Validates the GitHub access token
   */
  async validateToken(accessToken) {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'SkillBridge/1.0'
        }
      });

      // Basic validation - check if we can access user data
      if (!response.data || !response.data.id) {
        throw new Error('Invalid GitHub token');
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error.message);
      throw new Error('Invalid GitHub token provided');
    }
  }

  async syncGitHubData(userId) {
    console.log('Starting GitHub data sync for user:', userId);

    try {
      // Get user's GitHub username from the database
      const profileResult = await githubRepo.getGitHubData(userId);
      if (!profileResult) {
        throw new Error('GitHub profile not found for user');
      }

      const githubUsername = profileResult.stats?.github_username || profileResult.stats?.username;
      if (!githubUsername) {
        throw new Error('GitHub username not found for user');
      }

      console.log('Syncing GitHub data for:', githubUsername);

      // Get detailed stats
      const stats = await externalGitHubService.fetchDeveloperStats(githubUsername);

      // Enhance stats with additional data
      const enhancedStats = {
        ...stats,
        contributionStreak: await this.calculateContributionStreak(env.GITHUB_TOKEN, githubUsername),
        consistencyScore: this.calculateConsistencyScore(stats),
        weeklyActivity: await this.getWeeklyActivity(env.GITHUB_TOKEN, githubUsername),
        mostActiveDays: await this.getMostActiveDays(env.GITHUB_TOKEN, githubUsername)
      };

      // Get repositories
      const repositories = await this.fetchRepositories(env.GITHUB_TOKEN, githubUsername);

      console.log('Updating GitHub stats for user:', userId);
      await githubRepo.saveGitHubStats({
        userId,
        stats: enhancedStats,
      });

      console.log('Updating GitHub repositories for user:', userId);
      await githubRepo.saveGitHubRepositories(userId, repositories);

      console.log('GitHub data sync completed successfully');
    } catch (error) {
      console.error('Error in GitHub data sync:', error.message);
      throw error;
    }
  }

  async disconnectGitHubAccount(userId) {
    console.log('Disconnecting GitHub account for user:', userId);

    try {
      // Remove GitHub references from user profile
      await githubRepo.detachGitHubAccount(userId);

      // Clear GitHub stats and repositories
      const profileResult = await githubRepo.getGitHubData(userId);
      if (profileResult) {
        const profileId = profileResult.stats?.profile_id;

        if (profileId) {
          await githubRepo.deleteGitHubStats(profileId);
          await githubRepo.deleteGitHubRepositories(profileId);
        }
      }

      console.log('GitHub account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting GitHub account:', error.message);
      throw error;
    }
  }

  calculateAccountAgeInMonths(created_at) {
    const createdAt = new Date(created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdAt);
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }

  async calculateContributionStreak(token, username) {
    try {
      // Get contribution calendar data
      const response = await axios.get(
        `https://api.github.com/users/${username}/events`,
        {
          headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'SkillBridge/1.0'
          },
        },
      );

      // Simplified calculation - in a real implementation, we'd parse the contribution calendar
      // This is a placeholder implementation
      const events = response.data;
      // Count consecutive days with contributions
      // This is a simplified version - a real implementation would parse the contribution graph API
      return Math.min(events.length, 365); // Placeholder value
    } catch (error) {
      console.error('Error calculating contribution streak:', error.message);
      return 0;
    }
  }

  calculateConsistencyScore(stats) {
    // Calculate a consistency score based on various factors
    // This is a simplified algorithm - could be enhanced with more sophisticated metrics
    const { commits30d, publicRepos, followers, totalStars } = stats;

    // Normalize values to 0-1 scale
    const commitScore = Math.min(commits30d / 30, 1); // Assuming 30 commits in 30 days is excellent
    const repoScore = Math.min(publicRepos / 20, 1); // Assuming 20 repos is excellent
    const followerScore = Math.min(followers / 100, 1); // Assuming 100 followers is excellent
    const starScore = Math.min(totalStars / 100, 1); // Assuming 100 stars is excellent

    // Weighted average
    const consistencyScore = (commitScore * 0.4) + (repoScore * 0.2) + (followerScore * 0.2) + (starScore * 0.2);

    return parseFloat(consistencyScore.toFixed(2));
  }

  async getWeeklyActivity(token, username) {
    try {
      // Get activity data for the past week
      const response = await axios.get(
        `https://api.github.com/users/${username}/events`,
        {
          headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'SkillBridge/1.0'
          },
        },
      );

      // Group events by day of the week
      const weeklyActivity = {};
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      days.forEach(day => {
        weeklyActivity[day] = 0;
      });

      response.data.forEach(event => {
        const date = new Date(event.created_at);
        const dayOfWeek = days[date.getDay()];
        weeklyActivity[dayOfWeek] = (weeklyActivity[dayOfWeek] || 0) + 1;
      });

      return weeklyActivity;
    } catch (error) {
      console.error('Error getting weekly activity:', error.message);
      return {};
    }
  }

  async getMostActiveDays(token, username) {
    try {
      const weeklyActivity = await this.getWeeklyActivity(token, username);

      // Sort days by activity count
      const sortedDays = Object.entries(weeklyActivity)
        .sort(([,a], [,b]) => b - a)
        .map(([day]) => ({ day, activity: weeklyActivity[day] }));

      return sortedDays.slice(0, 3); // Return top 3 most active days
    } catch (error) {
      console.error('Error getting most active days:', error.message);
      return [];
    }
  }

  async fetchRepositories(token, username) {
    try {
      // Fetch all public repositories for the user
      const response = await axios.get(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'SkillBridge/1.0'
          },
          params: {
            type: 'all', // Include public, private, forks
            sort: 'updated', // Sort by last updated
            direction: 'desc', // Descending order
            per_page: 100, // Max per page
          }
        }
      );

      // Process and return repository data
      return response.data.map(repo => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        last_updated: repo.updated_at,
        is_public: repo.private === false,
        is_fork: repo.fork,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        size: repo.size,
        default_branch: repo.default_branch
      })).filter(repo => !repo.is_fork); // Exclude forked repositories
    } catch (error) {
      console.error('Error fetching repositories:', error.message);
      return [];
    }
  }
}

export default new GitHubOAuthService();
