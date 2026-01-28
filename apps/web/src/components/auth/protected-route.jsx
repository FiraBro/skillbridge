import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the vanilla login page
    // Note: Since we are using vanilla HTML for auth now, we might want to redirect there
    // Or if the React Login page still exists, use that.
    // The user recently asked for vanilla auth pages in public/auth/
    window.location.href = "/auth/login";
    return null;
  }

  return <Outlet />;
};
