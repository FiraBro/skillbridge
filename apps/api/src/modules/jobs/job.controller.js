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
    // Ensure skills is handled as an array even if one or zero skills provided
    skills: req.query.skills
      ? Array.isArray(req.query.skills)
        ? req.query.skills
        : req.query.skills.split(",")
      : [],
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
  const job = await jobService.getJobDetails(jobId, userId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return res.status(200).json(apiResponse.success(job));
});

/**
 * PATCH /api/jobs/:id/publish
 * Toggle the publish status of a job
 */
export const togglePublish = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const clientId = req.user.id;
  const { isPublished } = req.body;

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

/**
 * GET /api/jobs/:id/applicants
 * Get list of applicants for a job (company only)
 */
export const getApplicants = catchAsync(async (req, res, next) => {
  const jobId = req.params.id;
  const clientId = req.user.id;

  const applicants = await jobService.getJobApplicants(jobId, clientId);
  return res.status(200).json(apiResponse.success(applicants));
});

/**
 * PATCH /api/jobs/applications/:applicationId
 * Update applicant status and private notes (formerly updateUplicant)
 */
export const updateApplicationFeedback = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;
  const clientId = req.user.id;
  const { status, notes } = req.body;

  const updatedApplication = await jobService.updateApplicationFeedback(
    applicationId,
    clientId,
    {
      status,
      notes,
    },
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
 * Get jobs for authenticated company including applicant counts
 */
export const getCompanyJobs = catchAsync(async (req, res, next) => {
  const clientId = req.user.id;
  const jobs = await jobService.getCompanyJobs(clientId);
  return res.status(200).json(apiResponse.success(jobs));
});
