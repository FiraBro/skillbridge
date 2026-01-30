import { Router } from "express";
import * as jobController from "./job.controller.js";
import { authorize, requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();

// Browse jobs
router.get("/", jobController.browse);

// Get recommended jobs (Authentication required)
router.get("/recommended", requireAuth, jobController.getRecommended);

// Create job (Authentication required - usually for clients)
router.post("/", requireAuth, authorize("company"), jobController.create);

// Get jobs posted by authenticated company
router.get("/company", requireAuth, jobController.getCompanyJobs);

// Get job details
router.get("/:id", jobController.getById);

// Apply to job (Authentication required)
router.post(
  "/:id/apply",
  requireAuth,
  authorize("developer"),
  jobController.apply,
);

// Get applicants for a job (company only)
router.get(
  "/:id/applicants",
  requireAuth,
  authorize("company"),
  jobController.getApplicants,
);

export default router;
