// apps/web/src/components/auth/AuthCheckOrLanding.jsx
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import LandingPage from "@/app/LandingPage";

const AuthCheckOrLanding = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to the correct dashboard based on role
    switch (user?.role) {
      case "admin":
        return <Navigate to="/app/admin" replace />;
      case "company":
        return <Navigate to="/app/company-dashboard" replace />;
      case "developer":
        return <Navigate to="/app/dashboard" replace />;
      default:
        return <Navigate to="/app/dashboard" replace />;
    }
  }

  // Guest: show landing page
  return <LandingPage />;
};

export default AuthCheckOrLanding;
