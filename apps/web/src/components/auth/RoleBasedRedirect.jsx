import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const RoleRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. If still checking authentication, show the spinner
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

  // 2. If not authenticated, the ProtectedRoute parent should have caught this,
  // but we add a fallback here just in case.
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Match the paths defined in your router.jsx exactly
  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "company":
      return <Navigate to="/company-dashboard" replace />;
    case "developer":
      return <Navigate to="/dashboard" replace />;
    default:
      // If the role is unexpected, clear the path to dashboard
      return <Navigate to="/dashboard" replace />;
  }
};

export default RoleRedirect;
