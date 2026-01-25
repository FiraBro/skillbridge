// apps/web/src/app/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/components/layout/auth-layout";
// Lazy load pages for performance
const Login = lazy(() => import("./auth/login"));
const Register = lazy(() => import("./auth/register"));
const ForgotPassword = lazy(() => import("./auth/forgot-password"));
const ResetPassword = lazy(() => import("./auth/reset-password"));

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={null}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={null}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={null}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <Suspense fallback={null}>
            <ResetPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
]);
