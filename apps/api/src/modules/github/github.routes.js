import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  githubOAuthRateLimit,
  githubRateLimit,
  githubSyncRateLimit,
} from "../middlewares/githubRateLimit.js";
import {
  redirectToGitHub,
  githubCallback,
  getGitHubProfile,
  syncGitHubData,
  disconnectGitHub,
  updatePinnedRepos,
  updateHiddenRepos,
  exchangeCodeForTokens,
} from "./github.controller.js";

const router = Router();

router.get("/auth/github", requireAuth, redirectToGitHub);
router.get("/auth/github/callback", githubCallback); // No auth required as user context is passed via state parameter

// Public endpoint with rate limiting
router.get("/profile/:username", githubRateLimit, getGitHubProfile);

// Protected routes for authenticated users with appropriate rate limiting
router.post("/sync", requireAuth, githubSyncRateLimit, syncGitHubData);
router.delete("/disconnect", requireAuth, githubRateLimit, disconnectGitHub);
router.patch("/pinned-repos", requireAuth, githubRateLimit, updatePinnedRepos);
router.patch("/hidden-repos", requireAuth, githubRateLimit, updateHiddenRepos);

// Endpoint for exchanging GitHub code for tokens (for client-side flow)
router.post("/exchange-code", requireAuth, exchangeCodeForTokens);

export default router;
