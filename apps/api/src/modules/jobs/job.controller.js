import * as jobService from "./job.service.js";
import apiResponse from "../utils/apiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/apiError.js";

/**
 * GET /api/jobs
 * Browse or search jobs
 */
export const browse = catchAsync(async (req, res, next) => {
  const filters = {
    search: req.query.search,
    skills: req.query.skills ? req.query.skills.split(",") : [],
  };

  const jobs = await jobService.browseJobs(filters);
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
 * Create a new job post
 */
export const create = catchAsync(async (req, res, next) => {
  const clientId = req.user.id;
  const {
    title,
    description,
    budgetRange,
    requiredSkills,
    expectedOutcome,
    trialFriendly,
  } = req.body;

  const job = await jobService.createJob(clientId, {
    title,
    description,
    budgetRange,
    requiredSkills,
    expectedOutcome,
    trialFriendly,
  });

  return res.status(201).json(apiResponse.success(job));
});

/**
 * GET /api/jobs/:id
 * Get job details
 */
export const getById = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const userId = req.user?.id;
  const job = await jobService.getJobDetails(jobId, userId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return res.status(200).json(apiResponse.success(job));
});

/**
 * POST /api/jobs/:id/apply
 * Apply to a job
 */
export const apply = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const developerId = req.user.id;
  const { message } = req.body;

  const application = await jobService.applyToJob(jobId, developerId, message);
  return res
    .status(201)
    .json(
      apiResponse.success(application, "Application submitted successfully"),
    );
});
