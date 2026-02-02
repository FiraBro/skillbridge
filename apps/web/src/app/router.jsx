// apps/web/src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/components/layout/auth-layout";
import AppLayout from "@/layouts/app.layout.jsx";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "@/components/auth/protected-route";

// Lazy imports
const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const ForgotPassword = lazy(() => import("./auth/forgot-password"));
const ResetPassword = lazy(() => import("./auth/reset-password"));

const Profile = lazy(() => import("@/app/profile/[id]/page.jsx"));
const Dashboard = lazy(() => import("./dashboard/page.jsx"));

const CompanyDashboard = lazy(() => import("./companies/dashboard/page.jsx"));
const TalentDiscovery = lazy(() => import("./companies/discovery/page.jsx"));
const CompanyProfile = lazy(() => import("./companies/profile/page.jsx"));
const CreateJob = lazy(() => import("./jobs/create/page.jsx"));
const ApplicantReview = lazy(() => import("./companies/applicants/page.jsx"));

const Search = lazy(() => import("./search/page.jsx"));
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
// Loader for suspense
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// Role constants
const ROLES = {
  DEVELOPER: "developer",
  COMPANY: "company",
  ADMIN: "admin",
};

export const router = createBrowserRouter([
  // -------------------- AUTH ROUTES --------------------
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

  // -------------------- PROTECTED ROUTES --------------------
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      // General authenticated routes (any logged-in user)
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          {
            path: "/profile/:username",
            element: (
              <ErrorBoundary fallback={<div>A critical error occurred.</div>}>
                <Profile />
              </ErrorBoundary>
            ),
          },
          { path: "/jobs", element: <Jobs /> },
          { path: "/jobs/:id", element: <JobDetail /> },
          { path: "/search", element: <Search /> },
          { path: "/posts/create", element: <PostCreate /> },
          { path: "/posts/:slug", element: <PostDetail /> },
          { path: "/posts/:slug/edit", element: <PostEdit /> },
          { path: "/notifications", element: <Notifications /> },
        ],
      },

      // -------------------- COMPANY ONLY --------------------
      {
        element: <ProtectedRoute allowedRoles={[ROLES.COMPANY]} />,
        children: [
          { path: "/company-dashboard", element: <CompanyDashboard /> },
          { path: "/discovery", element: <TalentDiscovery /> },
          { path: "/company/settings", element: <CompanyProfile /> },
          { path: "/jobs/create", element: <CreateJob /> },
          { path: "/applicants/:jobId", element: <ApplicantReview /> },
        ],
      },

      // -------------------- ADMIN ONLY --------------------
      {
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [{ path: "/admin", element: <Admin /> }],
      },

      // Root redirect

      { path: "/", element: <RoleRedirect /> },
    ],
  },

  // -------------------- 404 --------------------
  {
    path: "*",
    element: (
      <div className="p-20 text-center text-muted-foreground font-medium italic">
        404 - Skill Not Found
      </div>
    ),
  },
]);
