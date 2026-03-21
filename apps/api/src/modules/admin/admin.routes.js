// admin.routes.js
import express from "express";
import * as controller from "./admin.controller.js";
import { validatePagination, validateUserQuery } from "./admin.validation.js";

import { authorize, requireAuth } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.use(requireAuth, authorize("admin"));

/* ================= DASHBOARD ================= */
router.get("/dashboard/stats", controller.getDashboardStats);
router.get("/activity", validatePagination, controller.getActivity);

/* ================= USERS ================= */
router.get("/users", validateUserQuery, controller.getUsers);
router.patch("/users/:id/suspend", controller.toggleSuspendUser);

/* ================= REPORTS ================= */
router.get("/reports", validatePagination, controller.getReports);
router.patch("/reports/:id/resolve", controller.resolveReport);

/* ================= SYSTEM ================= */
router.get("/system-health", controller.getSystemHealth);

export default router;
