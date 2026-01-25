import githubService from "../../services/github.service.js";
import { calculateReputation } from "../reputation/reputation.service.js";
import apiResponse from "../../utils/apiResponse.js";

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

    return res
      .status(200)
      .json(apiResponse.success({ ...stats, reputation_score: newScore }));
  } catch (error) {
    next(error);
  }
};
