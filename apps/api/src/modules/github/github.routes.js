import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { redirectToGitHub, githubCallback } from "./github.controller.js";
const router = Router();

router.get("/auth/github", requireAuth, redirectToGitHub);
router.get("/auth/github/callback", requireAuth, githubCallback);

export default router;
