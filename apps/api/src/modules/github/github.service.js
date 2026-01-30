import axios from "axios";
import { env } from "../../config/env.js";
import githubRepo from "./github.repository.js";
import githubService from "../services/github.service.js";
class GitHubOAuthService {
  async connectGitHubAccount(code, userId) {
    // 1. Exchange code for token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error("GitHub token missing");

    // 2. Fetch GitHub identity
    const { data: githubUser } = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const { id, login, avatar_url } = githubUser;

    // 3. Persist identity (ownership proof)
    await githubRepo.attachGitHubAccount({
      userId,
      githubId: id,
      username: login,
      avatar: avatar_url,
    });

    // 4. Fetch & cache stats
    const stats = await githubService.fetchDeveloperStats(login);

    await githubRepo.saveGitHubStats({
      userId,
      stats,
      avatar: avatar_url,
    });
  }
}

export default new GitHubOAuthService();
