import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// ✅ Global middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows images to be loaded by frontend
  }),
);
app.use(express.json());
app.use(cookieParser());

// ✅ Dynamic CORS and Static Files Fix
const allowedOrigins = [
  "http://localhost:5173",
  "https://skillbridge-nwz6dhjhx-firagos-projects.vercel.app", // Your Vercel URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "modules/uploads")),
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
app.use("/api/moderation", adminRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/test", testRoutes);

// 🔹 Global error handler
app.use(globalErrorHandler);

// 🔥 THE GHOST FIX: Catch any Redis connection errors that aren't handled elsewhere
process.on("unhandledRejection", (reason) => {
  if (reason && reason.message && reason.message.includes("ECONNREFUSED")) {
    console.warn(
      "⚠️ A background service (Redis) failed to connect. Skipping...",
    );
    return;
  }
  console.error("Unhandled Rejection:", reason);
});
