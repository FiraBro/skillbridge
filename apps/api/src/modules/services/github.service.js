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

      const repos = await this.#octokit.paginate(
        this.#octokit.repos.listForUser,
        {
          username,
          per_page: 100,
        },
      );

      const totalStars = repos.reduce(
        (acc, repo) => acc + repo.stargazers_count,
        0,
      );

      const languages = [
        ...new Set(repos.map((r) => r.language).filter(Boolean)),
      ];

      const { data: user } = await this.#octokit.users.getByUsername({
        username,
      });

      return {
        publicRepos: user.public_repos,
        followers: user.followers,
        totalStars,
        topLanguages: languages.slice(0, 5),
        avatarUrl: user.avatar_url,
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
        throw new ApiError("GitHub user not found", 404);
      }

      throw new ApiError("GitHub service unavailable", 500);
    }
  }
}

export default new GitHubService();
