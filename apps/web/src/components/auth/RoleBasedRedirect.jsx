import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  switch (user.role) {
    case "company":
      return <Navigate to="/company-dashboard" replace />;
    case "admin":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export default RoleRedirect;
