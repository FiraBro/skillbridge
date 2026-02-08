import { Router } from "express";
import * as jobController from "./job.controller.js";
import { authorize, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/* =========================
   Public Routes
========================= */

// Browse jobs (with filters)
router.get("/", jobController.browse);

/* =========================
   Developer Routes
========================= */

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

/* =========================
   Company Routes
========================= */

// Get all jobs posted by the logged-in company
router.get(
  "/company",
  requireAuth,
  authorize("company"),
  jobController.getCompanyJobs,
);

// Create a new job post
router.post("/", requireAuth, authorize("company"), jobController.create);

// Get list of applicants for a specific job
router.get(
  "/:id/applicants",
  requireAuth,
  authorize("company"),
  jobController.getApplicants,
);

// Toggle job status (Published/Draft)
router.patch(
  "/:id/publish",
  requireAuth,
  authorize("company"),
  jobController.togglePublish,
);

// Update application status (hired/rejected + notes)
router.patch(
  "/applications/:applicationId",
  requireAuth,
  authorize("company"),
  jobController.updateApplicationFeedback,
);

/* =========================
   Dynamic Route (ALWAYS LAST)
========================= */

// Get job details by ID
router.get("/:id", jobController.getById);

export default router;
