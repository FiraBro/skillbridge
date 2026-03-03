import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// apps/web/src/components/auth/protected-route.jsx

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Wait until auth state completely loads
  // ADDITION: Also wait if we are authenticated but the user object is still missing
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // 2. Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. Role Check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;

    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access Denied: Role "${userRole}" not authorized.`);
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
