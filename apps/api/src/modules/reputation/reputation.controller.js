import * as reputationService from "./reputation.service.js";
import apiResponse from "../utils/apiResponse.js";

/**
 * GET /api/reputation/:userId/breakdown
 * Get detailed reputation breakdown
 */
export async function getBreakdown(req, res, next) {
  try {
    const { userId } = req.params;

    const breakdown =
      await reputationService.getUserReputationBreakdown(userId);

    if (!breakdown) {
      return res.status(404).json(apiResponse.error("User not found", 404));
    }

    return res.status(200).json(apiResponse.success(breakdown));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reputation/:userId/history
 * Get reputation history
 */
export async function getHistory(req, res, next) {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = await reputationService.getUserReputationHistory(
      userId,
      limit,
    );

    return res.status(200).json(apiResponse.success(history));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reputation/:userId/recalculate
 * Recalculate user reputation (admin or self)
 */
export async function recalculate(req, res, next) {
  try {
    const { userId } = req.params;

    // TODO: Add authorization check (admin or self)

    const result = await reputationService.recalculateUserReputation(userId);

    if (!result) {
      return res.status(404).json(apiResponse.error("User not found", 404));
    }

    return res.status(200).json(apiResponse.success(result));
  } catch (error) {
    next(error);
  }
}
