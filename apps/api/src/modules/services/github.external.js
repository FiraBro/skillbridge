import axios from "axios";

/**
 * Service to handle external communication with GitHub API
 */
export const exchangeCodeForGithubUser = async (code) => {
  try {
    // 1. Exchange the temporary 'code' for an Access Token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      throw new Error("Failed to obtain access token from GitHub");
    }

    // 2. Use the Access Token to get the User's Profile
    const userResponse = await axios.get("https://github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 3. (Optional) Get the user's email if it's set to private
    // GitHub often returns null for email in the /user endpoint
    const emailResponse = await axios.get("https://github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const primaryEmail = emailResponse.data.find(
      (e) => e.primary && e.verified,
    )?.email;

    // 4. Return a clean object to our Auth Service
    return {
      id: userResponse.data.id,
      login: userResponse.data.login,
      avatar_url: userResponse.data.avatar_url,
      email: primaryEmail || userResponse.data.email,
      token: accessToken, // We pass this so the Worker can use it later for Sync
    };
  } catch (error) {
    console.error("GitHub OAuth Error:", error.response?.data || error.message);
    throw new Error("Authentication with GitHub failed");
  }
};
