import { Router } from "express";
import * as adminController from "./admin.controller.js";

const router = Router();

// Admin Endpoints (Restricted)
router.get("/stats", adminController.getStats);
router.get("/reports", adminController.getReports);
router.post("/reports/:id/resolve", adminController.resolveReport);
router.get("/settings/:key", adminController.getSettings);
router.patch("/settings/:key", adminController.updateSettings);

// Public Moderation Endpoints
router.post("/report", adminController.reportContent);

export default router;
