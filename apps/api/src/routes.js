import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import profileRoutes from "./modules/profile/profile.route.js";
const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/profiles", profileRoutes);

export default router;
