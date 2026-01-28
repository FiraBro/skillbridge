import { Router } from "express";
import * as jobController from "./job.controller.js";

const router = Router();

// Browse jobs
router.get("/", jobController.browse);

// Get recommended jobs (Authentication required)
router.get("/recommended", jobController.getRecommended);

// Create job (Authentication required - usually for clients)
router.post("/", jobController.create);

// Get job details
router.get("/:id", jobController.getById);

// Apply to job (Authentication required)
router.post("/:id/apply", jobController.apply);

export default router;
