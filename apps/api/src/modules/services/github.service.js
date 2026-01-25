// apps/api/src/services/github.service.js
import { Octokit } from "@octokit/rest";

export const fetchGithubStats = async (username, token) => {
  const octokit = new Octokit({ auth: token });

  // Fetch repos to calculate stars and languages
  const { data: repos } = await octokit.repos.listForUser({ username });

  const totalStars = repos.reduce(
    (acc, repo) => acc + repo.stargazers_count,
    0,
  );
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];

  return {
    total_stars: totalStars,
    top_languages: languages.slice(0, 3),
    repo_count: repos.length,
    updated_at: new Date(),
  };
};
