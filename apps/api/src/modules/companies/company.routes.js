import { Router } from "express";
import * as companyController from "./company.controller.js";
import { authorize, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.get("/discovery", requireAuth, companyController.discover);
router.use(requireAuth, authorize("company"));
// Company Profile
router.get("/profile", companyController.getProfile);
router.post("/profile", companyController.updateProfile);

// Talent Discovery

// Bookmarks
router.get("/bookmarks", companyController.getBookmarks);
router.post("/bookmarks/:devId", companyController.bookmark);
router.delete("/bookmarks/:devId", companyController.removeBookmark);

// Applicant Management
router.patch(
  "/applications/:appId/feedback",
  companyController.updateApplication,
);

export default router;
