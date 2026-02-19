import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url"; // 1. Import this helper

// 2. Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import globalErrorHandler from "./modules/middlewares/error.middleware.js";

// Import all route modules
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
import githubRoutes from "./modules/github/github.routes.js";
import testRoutes from "./modules/test.route.js";

export const app = express();

// ✅ Global middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
// // Serve uploads folder correctly
// const uploadsFolder = path.join(__dirname, "modules/uploads");
// console.log("Serving uploads from:", uploadsFolder); // debug
// app.use("/uploads", express.static(uploadsFolder));

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "modules/uploads")),
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use((req, res, next) => {
  console.log("🌍 INCOMING REQUEST:", req.method, req.url);
  next();
});

// 🔹 Mount route modules
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/endorsements", endorsementRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderation", adminRoutes); // reuse for moderation/report
app.use("/api/github", githubRoutes); // ✅ GitHub routes correctly mounted
app.use("/api/test", testRoutes);

// 🔹 Global error handler (must be last)
app.use(globalErrorHandler);
