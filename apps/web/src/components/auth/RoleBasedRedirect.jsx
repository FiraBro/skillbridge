import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RoleRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. Critical: Wait for the session to load
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // 2. If session finishes and user isn't logged in, send to Login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Logic-based redirection
  // Ensure these paths match exactly what you defined in your <Route /> definitions
  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin-dashboard" replace />;
    case "client":
      return <Navigate to="/company-dashboard" replace />;
    case "developer":
      return <Navigate to="/dashboard" replace />;
    default:
      // Fallback for safety (e.g., if a role is undefined)
      return <Navigate to="/dashboard" replace />;
  }
};

export default RoleRedirect;
