import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import postsRoutes from "./modules/posts/post.routes.js";
import profileRoutes from "./modules/profile/profile.route.js";
import projectRoutes from "./modules/projects/project.routes.js";
const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/profiles", profileRoutes);
router.use("/api/posts", postsRoutes);
router.use("/api/projects", projectRoutes);
export default router;
