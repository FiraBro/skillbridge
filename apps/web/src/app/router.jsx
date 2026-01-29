import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "@/components/layout/auth-layout";
import AppLayout from "@/layouts/app.layout.jsx";
import { ErrorBoundary } from "react-error-boundary";
import { ProtectedRoute } from "@/components/auth/protected-route";

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
const PostDetail = lazy(() => import("./posts/[slug]/page.jsx"));
const PostCreate = lazy(() => import("./posts/create/page.jsx"));
const PostEdit = lazy(() => import("./posts/[slug]/edit/page.jsx"));

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const routes = [
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
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <AppLayout />
      </Suspense>
    ),
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "/profile/:username",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary fallback={<div>A critical error occurred.</div>}>
                  <Profile />
                </ErrorBoundary>
              </Suspense>
            ),
          },
          {
            path: "/posts/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PostCreate />
              </Suspense>
            ),
          },
          {
            path: "/posts/:slug",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PostDetail />
              </Suspense>
            ),
          },
          {
            path: "/posts/:slug/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PostEdit />
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
            path: "/jobs/create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CreateJob />
              </Suspense>
            ),
          },
          {
            path: "/applicants/:jobId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ApplicantReview />
              </Suspense>
            ),
          },
          {
            path: "/company-dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CompanyDashboard />
              </Suspense>
            ),
          },
          {
            path: "/discovery",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TalentDiscovery />
              </Suspense>
            ),
          },
          {
            path: "/company/settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CompanyProfile />
              </Suspense>
            ),
          },
          {
            path: "/search",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Search />
              </Suspense>
            ),
          },
          {
            path: "/admin",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Admin />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="p-20 text-center text-muted-foreground font-medium italic">
        404 - Skill Not Found
      </div>
    ),
  },
];

export const router = createBrowserRouter(routes);
