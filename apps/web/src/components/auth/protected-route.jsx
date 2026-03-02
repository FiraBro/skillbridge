import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * ProtectedRoute checks:
 * 1. If the user is logged in
 * 2. If the user has the required role(s)
 */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Wait until auth state loads
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // 2. Redirect to login if not authenticated
  // We save the current location in state so we can redirect them back after login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. If specific roles are required, check if user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      console.warn(
        `Access Denied: Role "${user?.role}" is not authorized for this route.`,
      );

      // Redirect to /home, which will trigger RoleBasedRedirect.jsx
      // to send them to their specific dashboard (developer, client, or admin).
      return <Navigate to="/home" replace />;
    }
  }

  // 4. Authorized - Render the child routes
  return <Outlet />;
};
