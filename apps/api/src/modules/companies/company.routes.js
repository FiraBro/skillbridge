import { Router } from "express";
import * as companyController from "./company.controller.js";

const router = Router();

// Company Profile
router.get("/profile", companyController.getProfile);
router.post("/profile", companyController.updateProfile);

// Talent Discovery
router.get("/discovery", companyController.discover);

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
