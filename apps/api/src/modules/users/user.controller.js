import githubService from "../services/github.service.js";
import { calculateReputation } from "../reputation/reputation.service.js";
import apiResponse from "../utils/apiResponse.js";

export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    // 1. Fetch from DB (Mocked logic for now)
    const profile = await db.query(
      "SELECT * FROM profiles WHERE github_username = $1",
      [username],
    );

    // 2. Refresh stats if needed
    const stats = await githubService.getDeveloperStats(username);

    // 3. Recalculate reputation
    const newScore = calculateReputation(stats, 5);

    // 4. Record profile view (if viewer is authenticated)
    if (req.user && profile.rows[0]) {
      const viewerId = req.user.id;
      const viewerRole = req.user.role;
      const profileId = profile.rows[0].id;

      // Don't track self-views
      if (viewerId !== profile.rows[0].user_id) {
        import("./notifications/notification.service.js").then((service) => {
          service.recordProfileView(profileId, viewerId, viewerRole);
        });
      }
    }

    return res
      .status(200)
      .json(
        apiResponse.success({
          ...stats,
          reputation_score: newScore,
          profile_data: profile.rows[0],
        }),
      );
  } catch (error) {
    next(error);
  }
};
