import { env } from "../../config/env.js";
import githubService from "./github.service.js";
import githubRepo from "./github.repository.js";
import catchAsync from "../utils/catchAsync.js";
import { query } from "../../config/db.js";

export const redirectToGitHub = (req, res) => {
  console.log("Initiating GitHub OAuth flow for user:", req.user.id);
  console.log("GitHub Client ID configured:", !!env.GITHUB_CLIENT_ID);
  console.log("GitHub Callback URL configured:", env.GITHUB_CALLBACK_URL);

  // Store the user ID and username in the state parameter to maintain user context
  const state = Buffer.from(
    JSON.stringify({
      userId: req.user.id,
      username: req.user.username || req.user.name,
    }),
  ).toString("base64");

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${env.GITHUB_CLIENT_ID}` +
    `&scope=read:user%20repo` + // Extended scope to include repo access
    `&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(env.GITHUB_CALLBACK_URL)}`;

  console.log("Redirecting to GitHub URL:", url.substring(0, 100) + "..."); // Log first 100 chars
  res.redirect(url);
};

/**
 * Decode base64 state (supports standard and URL-safe base64).
 * GitHub may pass state with URL-safe chars; Buffer.from accepts standard base64.
 */
function decodeState(stateStr) {
  const normalized = stateStr.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

/**
 * GitHub OAuth callback. No auth middleware; user context comes from state.
 * Validates code/state, decodes state, exchanges code for token, then redirects to frontend.
 */
export const githubCallback = async (req, res, next) => {
  const frontendBase = env.FRONTEND_URL || "http://localhost:5173";

  const failRedirect = (error, details = "") => {
    const params = new URLSearchParams({ error });
    if (details) params.set("details", details);
    return res.redirect(`${frontendBase}/profile?${params.toString()}`);
  };

  try {
    const { code, state } = req.query;

    if (!state || typeof state !== "string" || !state.trim()) {
      return failRedirect("missing_state");
    }

    if (!code || typeof code !== "string" || !code.trim()) {
      return failRedirect("no_code");
    }

    let userInfo;
    try {
      const decodedState = decodeState(state.trim());
      userInfo = JSON.parse(decodedState);
    } catch (err) {
      return failRedirect("invalid_state", "state_decode_failed");
    }

    if (!userInfo || typeof userInfo.userId === "undefined") {
      return failRedirect("invalid_state", "missing_user_id");
    }

    const userId = userInfo.userId;
    await githubService.connectGitHubAccount(code, userId);

    const profileSegment = userInfo.username ? `/profile/${encodeURIComponent(userInfo.username)}` : "/profile";
    const redirectUrl = `${frontendBase}${profileSegment}?success=github_connected`;
    return res.redirect(redirectUrl);
  } catch (err) {
    const message = err.message || "callback_error";
    const safeDetails = encodeURIComponent(String(message).slice(0, 200));
    return failRedirect("callback_error", safeDetails);
  }
};

// Get GitHub profile data for a user
export const getGitHubProfile = catchAsync(async (req, res) => {
  const { username } = req.params;

  // Get user profile by username
  const profileQuery = await query(
    `SELECT u.id as user_id, p.id as profile_id, p.username, p.full_name, p.bio, p.location
     FROM users u
     JOIN profiles p ON u.id = p.user_id
     WHERE p.username = $1`,
    [username],
  );

  if (profileQuery.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const userId = profileQuery.rows[0].user_id;

  // Get GitHub data
  const githubData = await githubRepo.getGitHubData(userId);

  if (!githubData) {
    return res.status(404).json({ error: "GitHub profile not connected" });
  }

  res.json({
    profile: profileQuery.rows[0],
    github: githubData,
  });
});

// Sync GitHub data
export const syncGitHubData = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await githubService.syncGitHubData(userId);

  res.json({ success: true, message: "GitHub data synced successfully" });
});

// Disconnect GitHub account
export const disconnectGitHub = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await githubService.disconnectGitHubAccount(userId);

  res.json({
    success: true,
    message: "GitHub account disconnected successfully",
  });
});

// Update pinned repositories
export const updatePinnedRepos = catchAsync(async (req, res) => {
  const { pinnedRepos } = req.body;
  const userId = req.user.id;

  await githubRepo.updatePinnedRepos(userId, pinnedRepos);

  res.json({ success: true, message: "Pinned repositories updated" });
});

// Update hidden repositories
export const updateHiddenRepos = catchAsync(async (req, res) => {
  const { hiddenRepos } = req.body;
  const userId = req.user.id;

  await githubRepo.updateHiddenRepos(userId, hiddenRepos);

  res.json({ success: true, message: "Hidden repositories updated" });
});

// Exchange GitHub code for tokens (for client-side flow)
export const exchangeCodeForTokens = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log("Exchanging code for tokens for user:", userId);
    await githubService.connectGitHubAccount(code, userId);

    res.json({
      success: true,
      message: "GitHub account connected successfully",
    });
  } catch (error) {
    console.error("Error in exchangeCodeForTokens:", error);
    res.status(500).json({
      error: error.message || "Failed to connect GitHub account",
    });
  }
};
