import * as jobService from "./job.service.js";
import apiResponse from "../utils/apiResponse.js";

/**
 * GET /api/jobs
 * Browse or search jobs
 */
export async function browse(req, res, next) {
  try {
    const filters = {
      search: req.query.search,
      skills: req.query.skills ? req.query.skills.split(",") : [],
    };

    const jobs = await jobService.browseJobs(filters);
    return res.status(200).json(apiResponse.success(jobs));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/jobs/recommended
 * Get jobs recommended for the authenticated user
 */
export async function getRecommended(req, res, next) {
  try {
    const userId = req.user.id;
    const jobs = await jobService.getRecommendedJobs(userId);
    return res.status(200).json(apiResponse.success(jobs));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/jobs
 * Create a new job post
 */
export async function create(req, res, next) {
  try {
    const clientId = req.user.id;
    const job = await jobService.createJob(clientId, req.body);
    return res.status(201).json(apiResponse.success(job));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/jobs/:id
 * Get job details
 */
export async function getById(req, res, next) {
  try {
    const jobId = req.params.id;
    const userId = req.user?.id;
    const job = await jobService.getJobDetails(jobId, userId);

    if (!job) {
      return res.status(404).json(apiResponse.error("Job not found", 404));
    }

    return res.status(200).json(apiResponse.success(job));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/jobs/:id/apply
 * Apply to a job
 */
export async function apply(req, res, next) {
  try {
    const jobId = req.params.id;
    const developerId = req.user.id;
    const { message } = req.body;

    const application = await jobService.applyToJob(
      jobId,
      developerId,
      message,
    );
    return res
      .status(201)
      .json(
        apiResponse.success(application, "Application submitted successfully"),
      );
  } catch (error) {
    if (error.message === "Already applied to this job") {
      return res.status(400).json(apiResponse.error(error.message, 400));
    }
    next(error);
  }
}
