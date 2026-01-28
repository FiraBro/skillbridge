// apps/web/src/app/router.jsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/components/layout/auth-layout";
import { ErrorBoundary } from "react-error-boundary";

// Consider a separate layout for the actual App/Profile later
// import AppLayout from "@/components/layout/app-layout";

const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const ForgotPassword = lazy(() => import("./auth/forgot-password"));
const ResetPassword = lazy(() => import("./auth/reset-password"));
// Change from relative to absolute-style alias
const Profile = lazy(() => import("@/app/profile/[id]/page.jsx"));
const Jobs = lazy(() => import("./jobs/page.jsx"));
// Loading spinner component for a professional feel
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: (
      // Centralized Suspense: One wrapper for all Auth routes
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
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    // Profile should be OUTSIDE AuthLayout so it can use the full screen
    path: "/profile/:id",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ErrorBoundary fallback={<div>A critical error occurred.</div>}>
          <Profile />
        </ErrorBoundary>
      </Suspense>
    ),
  },
  {
    path: "/jobs",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Jobs />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "*",
    element: <div className="p-20 text-center">404 - Skill Not Found</div>,
  },
]);

// apps/web/src/app/router.jsx
