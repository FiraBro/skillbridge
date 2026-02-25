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

// =============================================
// 1. GLOBAL MIDDLEWARES
// =============================================
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows images/uploads to be accessed by frontend
  }),
);
app.use(express.json());
app.use(cookieParser());

// =============================================
// 2. DYNAMIC CORS CONFIGURATION
// =============================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://skillbridge-web-sooty.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman/Mobile)
      // Allow localhost
      // Allow any Vercel deployment URL (including previews)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.error("🚨 CORS Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// =============================================
// 3. STATIC FILES & LOGGING
// =============================================
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
  console.log(`🌍 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =============================================
// 4. API ROUTES
// =============================================
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

// =============================================
// 5. ERROR HANDLING
// =============================================
app.use(globalErrorHandler);

// Catch unhandled Redis connection issues or Async crashes
process.on("unhandledRejection", (reason) => {
  if (reason && reason.message && reason.message.includes("ECONNREFUSED")) {
    console.warn(
      "⚠️ Background service (Redis) connection failed. Skipping...",
    );
    return;
  }
  console.error("🔥 Unhandled Rejection:", reason);
});

export default app;
