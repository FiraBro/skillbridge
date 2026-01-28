import { Router } from "express";
import * as endorsementController from "./endorsement.controller.js";

const router = Router();

// Create endorsement
router.post("/", endorsementController.create);

// Get endorsements for a user
router.get("/:userId", endorsementController.getByUser);

// Delete endorsement
router.delete("/:id", endorsementController.remove);

export default router;
