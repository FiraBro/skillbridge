import { env } from "../../config/env.js";
import githubService from "./github.service.js";

export const redirectToGitHub = (req, res) => {
  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${env.GITHUB_CLIENT_ID}` +
    `&scope=read:user` +
    `&redirect_uri=${env.GITHUB_CALLBACK_URL}`;

  res.redirect(url);
};

export const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const userId = req.user.id;

    await githubService.connectGitHubAccount(code, userId);

    res.redirect(`${env.FRONTEND_URL}/profile/${req.user.username}`);
  } catch (err) {
    next(err);
  }
};
