import * as endorsementService from "./endorsement.service.js";
import apiResponse from "../utils/apiResponse.js";

/**
 * POST /api/endorsements
 * Create a new endorsement
 */
export async function create(req, res, next) {
  try {
    const { endorsedId, skillId, message } = req.body;
    const endorserId = req.user.id; // Assuming auth middleware sets req.user

    // TODO: Add proper authentication check
    if (!endorserId) {
      return res
        .status(401)
        .json(apiResponse.error("Authentication required", 401));
    }

    const endorsement = await endorsementService.createEndorsement(
      endorserId,
      endorsedId,
      skillId,
      message,
    );

    return res.status(201).json(apiResponse.success(endorsement));
  } catch (error) {
    if (error.message === "Cannot endorse yourself") {
      return res.status(400).json(apiResponse.error(error.message, 400));
    }
    next(error);
  }
}

/**
 * GET /api/endorsements/:userId
 * Get endorsements for a user
 */
export async function getByUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { groupBySkill } = req.query;

    let endorsements;
    if (groupBySkill === "true") {
      endorsements =
        await endorsementService.getUserEndorsementsBySkill(userId);
    } else {
      endorsements = await endorsementService.getUserEndorsements(userId);
    }

    return res.status(200).json(apiResponse.success(endorsements));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/endorsements/:id
 * Delete an endorsement
 */
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Assuming auth middleware

    if (!userId) {
      return res
        .status(401)
        .json(apiResponse.error("Authentication required", 401));
    }

    await endorsementService.deleteEndorsement(id, userId);

    return res
      .status(200)
      .json(apiResponse.success({ message: "Endorsement deleted" }));
  } catch (error) {
    if (
      error.message === "Endorsement not found" ||
      error.message === "Unauthorized to delete this endorsement"
    ) {
      return res.status(404).json(apiResponse.error(error.message, 404));
    }
    next(error);
  }
}
