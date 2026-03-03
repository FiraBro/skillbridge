// components/auth/RoleBasedRedirect.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Loader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        Authenticating...
      </p>
    </div>
  </div>
);

const RoleRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // ✅ wait only for auth initialization
  if (isLoading) return <Loader />;

  // fallback safety
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // ✅ IMPORTANT: paths must match router "/app/*"
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
};

export default RoleRedirect;
