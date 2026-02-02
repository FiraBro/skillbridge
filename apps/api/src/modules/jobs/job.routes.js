import { Router } from "express";
import * as jobController from "./job.controller.js";
import { authorize, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// --- Public/General Routes ---

// Browse jobs (with filters)
router.get("/", jobController.browse);

// Get job details (can be public or semi-private)
router.get("/:id", jobController.getById);

// --- Developer Routes ---

// Get recommended jobs based on developer profile
router.get(
  "/recommended",
  requireAuth,
  authorize("developer"),
  jobController.getRecommended,
);

// Apply to a specific job
router.post(
  "/:id/apply",
  requireAuth,
  authorize("developer"),
  jobController.apply,
);

// --- Company (Client) Routes ---

// Create a new job post
router.post("/", requireAuth, authorize("company"), jobController.create);

// Get all jobs posted by the logged-in company
router.get(
  "/company",
  requireAuth,
  authorize("company"),
  jobController.getCompanyJobs,
);

// Toggle job status (Published/Draft)
router.patch(
  "/:id/publish",
  requireAuth,
  authorize("company"),
  jobController.togglePublish,
);

// Get list of applicants for a specific job
router.get(
  "/:id/applicants",
  requireAuth,
  authorize("company"),
  jobController.getApplicants,
);

// Update status (hired/rejected) and private notes for a specific application
router.patch(
  "/applications/:applicationId",
  requireAuth,
  authorize("company"),
  jobController.updateApplicationFeedback,
);

export default router;
