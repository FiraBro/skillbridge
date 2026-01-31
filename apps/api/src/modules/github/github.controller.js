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

export const githubCallback = async (req, res, next) => {
  try {
    console.log("=== GITHUB CALLBACK DEBUG START ===");

    const { code, state } = req.query;
    console.log("Code parameter:", code ? "PRESENT" : "MISSING");
    console.log("State parameter:", state ? "PRESENT" : "MISSING");

    if (!state) {
      console.log("Missing state parameter");
      return res.redirect(
        `${env.FRONTEND_URL || "http://localhost:5173"}/profile?error=missing_state`,
      );
    }

    if (!code) {
      console.log("Missing code parameter");
      return res.redirect(
        `${env.FRONTEND_URL || "http://localhost:5173"}/profile?error=no_code`,
      );
    }

    // Decode state to get user info
    let userInfo;
    try {
      const decodedState = Buffer.from(state, "base64").toString();
      console.log("Decoded state parameter:", decodedState);
      userInfo = JSON.parse(decodedState);
      console.log("Decoded user info:", userInfo);
    } catch (err) {
      console.error("Error decoding state:", err);
      return res.redirect(
        `${env.FRONTEND_URL || "http://localhost:5173"}/profile?error=invalid_state`,
      );
    }

    // Now safe to use userInfo
    console.log("Connecting GitHub account for user:", userInfo.userId);
    console.log("=== CALLING GITHUB SERVICE ===");

    await githubService.connectGitHubAccount(code, userInfo.userId);

    console.log("=== GITHUB SERVICE COMPLETED SUCCESSFULLY ===");

    // Redirect to frontend profile page
    const redirectUrl = `${env.FRONTEND_URL || "http://localhost:5173"}/profile/${userInfo.username || userInfo.userId}?success=github_connected`;
    console.log("Redirecting to URL:", redirectUrl);
    res.redirect(redirectUrl);

    console.log("=== GITHUB CALLBACK DEBUG END ===");
  } catch (err) {
    console.error("=== GITHUB CALLBACK ERROR ===", err);
    res.redirect(
      `${env.FRONTEND_URL || "http://localhost:5173"}/profile?error=callback_error&details=${encodeURIComponent(err.message)}`,
    );
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
