import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Global Loading State
  // We wait if the auth is still fetching OR if we are authenticated
  // but the user data hasn't arrived yet.
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // 2. Guest Check
  if (!isAuthenticated) {
    // Save the location so we can redirect back after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. Permission (Role) Check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;

    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `Access Denied: Role "${userRole}" is not authorized for this route.`,
      );

      // Redirect to root "/" where RoleRedirect will send them
      // back to their own correct dashboard.
      return <Navigate to="/" replace />;
    }
  }

  // 4. Authorized - Render children (AppLayout or specific Page)
  return <Outlet />;
};
