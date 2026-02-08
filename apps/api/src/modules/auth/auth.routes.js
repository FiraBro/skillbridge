import { Router } from "express";
import * as controller from "./auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.delete("/delete/:id", requireAuth, controller.deleteUser);
router.get("/", controller.fetchUser);

export default router;
