import * as companyService from "./company.service.js";
import * as jobService from "../jobs/job.service.js";
import apiResponse from "../utils/apiResponse.js";

/**
 * GET /api/companies/profile
 * Get authenticated company's profile
 */
export async function getProfile(req, res, next) {
  try {
    const profile = await companyService.getCompanyProfile(req.user.id);
    return res.status(200).json(apiResponse.success(profile));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/companies/profile
 * Upsert company profile
 */
export async function updateProfile(req, res, next) {
  try {
    const profile = await companyService.upsertCompanyProfile(
      req.user.id,
      req.body,
    );
    return res
      .status(200)
      .json(apiResponse.success(profile, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/companies/discovery
 * Discover top developers
 */
// export async function discover(req, res, next) {
//   try {
//     const filters = {
//       skills: req.query.skills ? req.query.skills.split(",") : [],
//       minReputation: req.query.minReputation
//         ? parseInt(req.query.minReputation)
//         : 0,
//       search: req.query.search,
//     };

//     const developers = await companyService.discoverDevelopers(filters);
//     return res.status(200).json(apiResponse.success(developers));
//   } catch (error) {
//     next(error);
//   }
// }

export async function discover(req, res, next) {
  try {
    const filters = {
      // ✅ Handle both 'search' and 'q' from the frontend
      search: req.query.search || req.query.q || "",
      skills: req.query.skills ? req.query.skills.split(",") : [],
      minReputation: req.query.minReputation
        ? parseInt(req.query.minReputation)
        : 0,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 9,
    };

    const developers = await companyService.discoverDevelopers(filters);
    return res.status(200).json(apiResponse.success(developers));
  } catch (error) {
    next(error);
  }
}
/**
 * POST /api/companies/bookmarks/:devId
 * Bookmark a developer
 */
export async function bookmark(req, res, next) {
  try {
    const result = await companyService.bookmarkDeveloper(
      req.user.id,
      req.params.devId,
    );
    return res
      .status(201)
      .json(apiResponse.success(result, "Developer bookmarked"));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/companies/bookmarks/:devId
 * Remove bookmark
 */
export async function removeBookmark(req, res, next) {
  try {
    await companyService.removeBookmark(req.user.id, req.params.devId);
    return res.status(200).json(apiResponse.success(null, "Bookmark removed"));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/companies/bookmarks
 * Get list of bookmarked developers
 */
export async function getBookmarks(req, res, next) {
  try {
    const bookmarks = await companyService.getBookmarks(req.user.id);
    return res.status(200).json(apiResponse.success(bookmarks));
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/companies/applications/:appId/feedback
 * Provide feedback/update status on an application
 */
export async function updateApplication(req, res, next) {
  try {
    const application = await jobService.updateApplicationFeedback(
      req.params.appId,
      req.user.id,
      req.body,
    );

    if (!application) {
      return res
        .status(404)
        .json(apiResponse.error("Application not found or unauthorized", 404));
    }

    return res
      .status(200)
      .json(apiResponse.success(application, "Status updated"));
  } catch (error) {
    next(error);
  }
}
