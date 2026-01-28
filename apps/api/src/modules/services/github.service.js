import { Octokit } from "@octokit/rest";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";
import logger from "../utils/logger.js";

class GitHubService {
  #octokit;

  constructor() {
    this.#octokit = new Octokit({
      auth: env.GITHUB_TOKEN,
      userAgent: "SkillBridge/1.0",
      request: { timeout: 8000 },
    });
  }

  async fetchDeveloperStats(username) {
    try {
      logger.info(`🐙 GitHub sync for ${username}`);

      // Fetch user data
      const { data: user } = await this.#octokit.users.getByUsername({
        username,
      });

      // Fetch all public repos
      const repos = await this.#octokit.paginate(
        this.#octokit.repos.listForUser,
        {
          username,
          per_page: 100,
        },
      );

      // Calculate total stars
      const totalStars = repos.reduce(
        (acc, repo) => acc + repo.stargazers_count,
        0,
      );

      // Extract languages
      const languages = [
        ...new Set(repos.map((r) => r.language).filter(Boolean)),
      ];

      // Calculate commit frequency (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let totalCommits = 0;
      let commits30d = 0;

      // Fetch commits from top 10 most recently updated repos
      const recentRepos = repos
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 10);

      for (const repo of recentRepos) {
        try {
          const commits = await this.#octokit.paginate(
            this.#octokit.repos.listCommits,
            {
              owner: username,
              repo: repo.name,
              author: username,
              since: thirtyDaysAgo.toISOString(),
              per_page: 100,
            },
          );
          commits30d += commits.length;
        } catch (err) {
          // Skip repos we can't access (private, deleted, etc.)
          logger.warn(`Could not fetch commits for ${repo.name}`, {
            error: err.message,
          });
        }
      }

      // Estimate total commits from contribution stats
      try {
        const { data: events } =
          await this.#octokit.activity.listPublicEventsForUser({
            username,
            per_page: 100,
          });

        const pushEvents = events.filter((e) => e.type === "PushEvent");
        totalCommits = pushEvents.reduce((acc, event) => {
          return acc + (event.payload.commits?.length || 0);
        }, 0);
      } catch (err) {
        logger.warn("Could not fetch events for commit estimation", {
          error: err.message,
        });
      }

      // Calculate activity metrics
      const lastUpdatedRepo = repos[0]?.updated_at;
      const isActive = lastUpdatedRepo
        ? new Date() - new Date(lastUpdatedRepo) < 30 * 24 * 60 * 60 * 1000
        : false;

      return {
        publicRepos: user.public_repos,
        followers: user.followers,
        totalStars,
        totalCommits: totalCommits || commits30d, // Use commits30d as fallback
        commits30d,
        topLanguages: languages.slice(0, 5),
        avatarUrl: user.avatar_url,
        isActive,
        lastActivity: lastUpdatedRepo,
        accountCreated: user.created_at,
      };
    } catch (err) {
      logger.error("GitHub API error", {
        username,
        status: err.status,
        message: err.message,
      });
      console.error("DEBUG GITHUB ERROR:", {
        status: err.status,
        message: err.message,
        name: err.name,
      });
      if (err.status === 404) {
        throw new ApiError(404, "GitHub user not found");
      }

      throw new ApiError(500, "GitHub service unavailable");
    }
  }
}

export default new GitHubService();
