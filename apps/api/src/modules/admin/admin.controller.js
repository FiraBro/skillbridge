import * as adminService from "./admin.service.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Check if the user is an admin
 */
function checkAdmin(req) {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden: Admin access only");
  }
}

/**
 * GET /api/admin/stats
 */
export const getStats = catchAsync(async (req, res, next) => {
  checkAdmin(req);
  const stats = await adminService.getPlatformStats();
  return res.status(200).json(apiResponse.success(stats));
});

/**
 * GET /api/admin/reports
 */
export const getReports = catchAsync(async (req, res, next) => {
  checkAdmin(req);
  const reports = await adminService.getReports(req.query.status);
  return res.status(200).json(apiResponse.success(reports));
});

/**
 * POST /api/admin/reports/:id/resolve
 */
export const resolveReport = catchAsync(async (req, res, next) => {
  checkAdmin(req);
  const { action, notes } = req.body;
  const report = await adminService.resolveReport(req.params.id, action, notes);
  return res.status(200).json(apiResponse.success(report, "Report resolved"));
});

/**
 * GET /api/admin/settings/:key
 */
export const getSettings = catchAsync(async (req, res, next) => {
  checkAdmin(req);
  const settings = await adminService.getSettings(req.params.key);
  return res.status(200).json(apiResponse.success(settings));
});

/**
 * PATCH /api/admin/settings/:key
 */
export const updateSettings = catchAsync(async (req, res, next) => {
  checkAdmin(req);
  const settings = await adminService.updateSettings(req.params.key, req.body);
  return res
    .status(200)
    .json(apiResponse.success(settings, "Settings updated"));
});

/**
 * POST /api/moderation/report
 * Open to all users
 */
export const reportContent = catchAsync(async (req, res, next) => {
  const report = await adminService.reportContent(req.user.id, req.body);
  return res
    .status(201)
    .json(
      apiResponse.success(
        report,
        "Report submitted. Thank you for keeping SkillBridge safe.",
      ),
    );
});
