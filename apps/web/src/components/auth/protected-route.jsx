import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * ProtectedRoute checks:
 * 1. If the user is logged in
 * 2. If the user has the required role(s)
 *
 * Usage:
 * <ProtectedRoute allowedRoles={['company', 'admin']} />
 */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Wait until auth state loads
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If roles are specified, check if user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // or an Unauthorized page
  }

  // Authorized
  return <Outlet />;
};
