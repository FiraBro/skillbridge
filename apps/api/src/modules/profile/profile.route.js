import { Router } from "express";
import * as controller from "./profile.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/", requireAuth, controller.create);
router.get("/:username", controller.get);
router.patch("/sync", requireAuth, controller.sync);

export default router;
