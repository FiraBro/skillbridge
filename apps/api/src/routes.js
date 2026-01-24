import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";

const router = Router();

router.use("/api/auth", authRoutes);

export default router;
