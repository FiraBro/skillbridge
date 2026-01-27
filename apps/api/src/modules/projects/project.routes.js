import express from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createProject,
  listProjects,
  getProject,
} from "./project.controller.js";

const router = express.Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, writeLimiter, createProject);

export default router;
