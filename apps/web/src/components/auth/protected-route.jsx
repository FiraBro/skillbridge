import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ✅ Only wait for auth initialization
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // ✅ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // ✅ Role check
  if (allowedRoles?.length) {
    const userRole = user?.role;

    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `Access Denied: Role "${userRole}" is not authorized for this route.`,
      );

      return <Navigate to="/" replace />;
    }
  }

  // ✅ Render nested routes
  return <Outlet />;
};
