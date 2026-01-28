import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import postsRoutes from "./modules/posts/post.routes.js";
import profileRoutes from "./modules/profile/profile.route.js";
import projectRoutes from "./modules/projects/project.routes.js";
import reputationRoutes from "./modules/reputation/reputation.routes.js";
import endorsementRoutes from "./modules/endorsements/endorsement.routes.js";
import jobRoutes from "./modules/jobs/job.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import companyRoutes from "./modules/companies/company.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
const router = Router();

router.use("/api/auth", authRoutes);
router.use("/api/profiles", profileRoutes);
router.use("/api/posts", postsRoutes);
router.use("/api/projects", projectRoutes);
router.use("/api/reputation", reputationRoutes);
router.use("/api/endorsements", endorsementRoutes);
router.use("/api/jobs", jobRoutes);
router.use("/api/notifications", notificationRoutes);
router.use("/api/companies", companyRoutes);
router.use("/api/search", searchRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/moderation", adminRoutes); // Reuse for /report access
export default router;
