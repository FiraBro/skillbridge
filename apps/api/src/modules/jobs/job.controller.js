import * as jobService from "./job.service.js";
import apiResponse from "../utils/apiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/apiError.js";

/**
 * GET /api/jobs
 * Browse or search jobs with Pagination
 */
export const browse = catchAsync(async (req, res, next) => {
  // 1. Sanitize Pagination (Real companies never return unlimited data)
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  const filters = {
    search: req.query.search?.trim(),
    skills: req.query.skills
      ? Array.isArray(req.query.skills)
        ? req.query.skills
        : req.query.skills.split(",")
      : [],
  };

  const jobs = await jobService.browseJobs(filters, limit, offset);
  return res.status(200).json(apiResponse.success(jobs));
});

/**
 * GET /api/jobs/recommended
 * Get jobs recommended for the authenticated user
 */
export const getRecommended = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const jobs = await jobService.getRecommendedJobs(userId);
  return res.status(200).json(apiResponse.success(jobs));
});

/**
 * POST /api/jobs
 * Create a new job post with Field Whitelisting
 */
export const create = catchAsync(async (req, res, next) => {
  const clientId = req.user.id;

  // Whitelist fields to prevent mass assignment security vulnerabilities
  const {
    title,
    description,
    budgetRange,
    requiredSkills,
    expectedOutcome,
    trialFriendly,
  } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Job title and description are required");
  }

  const job = await jobService.createJob(clientId, {
    title,
    description,
    budgetRange,
    requiredSkills,
    expectedOutcome,
    trialFriendly,
  });

  return res
    .status(201)
    .json(apiResponse.success(job, "Job created successfully"));
});

/**
 * GET /api/jobs/:id
 * Get job details
 */
export const getById = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const userId = req.user?.id;

  // Note: jobService.getJobDetails must be defined in your service file
  const job = await jobService.getJobDetails(jobId, userId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return res.status(200).json(apiResponse.success(job));
});

/**
 * PATCH /api/jobs/:id/publish
 */
export const togglePublish = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const clientId = req.user.id;
  const { isPublished } = req.body;

  if (typeof isPublished !== "boolean") {
    throw new ApiError(400, "isPublished must be a boolean value");
  }

  const job = await jobService.toggleJobPublish(jobId, clientId, isPublished);
  return res
    .status(200)
    .json(
      apiResponse.success(
        job,
        `Job ${isPublished ? "published" : "unpublished"} successfully`,
      ),
    );
});

/**
 * POST /api/jobs/:id/apply
 */
export const apply = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const developerId = req.user.id;
  const { message, milestones } = req.body; // Extract milestones from frontend

  // Validation
  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    throw new ApiError(400, "You must provide at least one milestone.");
  }

  const application = await jobService.applyToJob(jobId, developerId, {
    message,
    milestones,
  });

  return res
    .status(201)
    .json(apiResponse.success(application, "Proposal submitted successfully"));
});

/**
 * GET /api/jobs/:id/applicants
 */
export const getApplicants = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const clientId = req.user.id;

  const applicants = await jobService.getJobApplicants(jobId, clientId);
  return res.status(200).json(apiResponse.success(applicants));
});

/**
 * PATCH /api/jobs/applications/:applicationId
 */
export const updateApplicationFeedback = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;
  const clientId = req.user.id;
  const { status, notes } = req.body;

  // Real-world validation: Only allow specific statuses
  const validStatuses = [
    "shortlisted",
    "rejected",
    "interviewing",
    "hired",
    "pending",
  ];
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const updatedApplication = await jobService.updateApplicationFeedback(
    applicationId,
    clientId,
    { status, notes },
  );

  return res
    .status(200)
    .json(
      apiResponse.success(
        updatedApplication,
        "Application updated successfully",
      ),
    );
});

/**
 * GET /api/jobs/company/all
 */
export const getCompanyJobs = catchAsync(async (req, res, next) => {
  const clientId = req.user.id;
  const jobs = await jobService.getCompanyJobs(clientId);
  return res.status(200).json(apiResponse.success(jobs));
});
