import { Router } from "express";
import * as reputationController from "./reputation.controller.js";

const router = Router();

// Get reputation breakdown
router.get("/:userId/breakdown", reputationController.getBreakdown);

// Get reputation history
router.get("/:userId/history", reputationController.getHistory);

// Recalculate reputation
router.post("/:userId/recalculate", reputationController.recalculate);

export default router;
