// apps/web/src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/components/layout/auth-layout";
import AppLayout from "@/layouts/app.layout.jsx";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "@/components/auth/protected-route";
import ProposalPage from "./developers/ProposalPage";
import LandingPage from "./LandingPage";

// Lazy imports
const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const ForgotPassword = lazy(() => import("./auth/forgot-password"));
const ResetPassword = lazy(() => import("./auth/reset-password"));
const Profile = lazy(() => import("@/app/profile/[id]/page.jsx"));
const Dashboard = lazy(() => import("./dashboard/page.jsx"));
const CompanyDashboard = lazy(() => import("./companies/dashboard/page.jsx"));
const CreateJob = lazy(() => import("./jobs/create/page.jsx"));
const ApplicantReview = lazy(() => import("./companies/applicants/page.jsx"));
const Admin = lazy(() => import("./admin/page.jsx"));
const Jobs = lazy(() => import("./jobs/page.jsx"));
const JobDetail = lazy(() => import("./jobs/[id]/page.jsx"));
const PostDetail = lazy(() => import("./posts/[slug]/page.jsx"));
const PostCreate = lazy(() => import("./posts/create/page.jsx"));
const PostEdit = lazy(() => import("./posts/[slug]/edit/page.jsx"));
const RoleRedirect = lazy(
  () => import("@/components/auth/RoleBasedRedirect.jsx"),
);
const Notifications = lazy(() => import("./notifications/page.jsx"));

const ROLES = {
  DEVELOPER: "developer",
  COMPANY: "company", // Matches your DB and Register form now
  ADMIN: "admin",
};

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  // --- 1. PUBLIC LANDING PAGE ---
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },

  // --- 2. AUTHENTICATION (GUESTS ONLY) ---
  {
    path: "/auth",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password/:token", element: <ResetPassword /> },
    ],
  },

  // --- 3. PROTECTED APP AREA ---
  {
    // LAYER 1: Redirects to /login if no token exists
    element: <ProtectedRoute />,
    children: [
      {
        // LAYER 2: Sidebar/Navbar only render if Layer 1 passes
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          // TRAFFIC CONTROLLER (Decides which dashboard to show based on role)
          { index: true, element: <RoleRedirect /> },

          // SHARED AUTHENTICATED ROUTES
          {
            path: "profile/:username",
            element: (
              <ErrorBoundary
                fallback={
                  <div className="p-10 text-red-500">
                    Error loading profile.
                  </div>
                }
              >
                <Profile />
              </ErrorBoundary>
            ),
          },
          { path: "jobs", element: <Jobs /> },
          { path: "jobs/:id", element: <JobDetail /> },
          { path: "notifications", element: <Notifications /> },
          { path: "posts/:slug", element: <PostDetail /> },

          // --- DEVELOPER ONLY ---
          {
            element: <ProtectedRoute allowedRoles={[ROLES.DEVELOPER]} />,
            children: [
              { path: "dashboard", element: <Dashboard /> },
              { path: "jobs/:id/apply", element: <ProposalPage /> },
              { path: "posts/create", element: <PostCreate /> },
              { path: "posts/:slug/edit", element: <PostEdit /> },
            ],
          },

          // --- COMPANY ONLY ---
          {
            element: <ProtectedRoute allowedRoles={[ROLES.COMPANY]} />,
            children: [
              { path: "company-dashboard", element: <CompanyDashboard /> },
              { path: "jobs/create", element: <CreateJob /> },
              { path: "applicants/:jobId", element: <ApplicantReview /> },
            ],
          },

          // --- ADMIN ONLY ---
          {
            element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ path: "admin", element: <Admin /> }],
          },
        ],
      },
    ],
  },

  // --- 4. FALLBACK ---
  {
    path: "*",
    element: (
      <div className="p-20 text-center font-bold text-gray-400">
        404 — Page Not Found
      </div>
    ),
  },
]);
