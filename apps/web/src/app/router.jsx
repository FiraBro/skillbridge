// apps/web/src/app/router.jsx
import { createBrowserRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/components/layout/auth-layout";
import AppLayout from "@/layouts/app.layout.jsx";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "@/components/auth/protected-route";
import ProposalPage from "./developers/ProposalPage";
import AuthCheckOrLanding from "@/components/auth/AuthCheckOrLandingPage";
// ---------- LAZY IMPORTS ----------
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

const Notifications = lazy(() => import("./notifications/page.jsx"));
const ChatPage = lazy(() => import("../components/ChatPage.jsx"));

// ---------- ROLES ----------
const ROLES = {
  DEVELOPER: "developer",
  COMPANY: "company",
  ADMIN: "admin",
};

// ---------- PAGE LOADER ----------
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);

// ---------- ROUTER ----------
export const router = createBrowserRouter([
  // =====================================================
  // 1️⃣ ROOT - Landing OR Authenticated Redirect
  // =====================================================
  {
    path: "/chats",
    element: <ChatPage />,
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthCheckOrLanding />
      </Suspense>
    ),
  },

  // =====================================================
  // 2️⃣ AUTH ROUTES
  // =====================================================
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

  // =====================================================
  // 3️⃣ PROTECTED APP ROUTES (all under /app)
  // =====================================================
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          // SHARED ROUTES
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

          // DEVELOPER
          {
            element: <ProtectedRoute allowedRoles={[ROLES.DEVELOPER]} />,
            children: [
              { path: "dashboard", element: <Dashboard /> },
              { path: "jobs/:id/apply", element: <ProposalPage /> },
              { path: "posts/create", element: <PostCreate /> },
              { path: "posts/:slug/edit", element: <PostEdit /> },
            ],
          },

          // COMPANY
          {
            element: <ProtectedRoute allowedRoles={[ROLES.COMPANY]} />,
            children: [
              { path: "company-dashboard", element: <CompanyDashboard /> },
              { path: "jobs/create", element: <CreateJob /> },
              { path: "applicants/:jobId", element: <ApplicantReview /> },
            ],
          },

          // ADMIN
          {
            element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ path: "admin", element: <Admin /> }],
          },
        ],
      },
    ],
  },

  // =====================================================
  // 4️⃣ FALLBACK
  // =====================================================
  {
    path: "*",
    element: (
      <div className="p-20 text-center font-bold text-gray-400">
        404 — Page Not Found go back to{" "}
        <Link to="/app/dashboard" className="text-blue-500 hover:underline">
          Dashboard
        </Link>{" "}
        or{" "}
        <Link to="/" className="text-blue-500 hover:underline">
          Home
        </Link>
        .
      </div>
    ),
  },
]);
