import { Outlet } from "react-router-dom";
import "@/styles/auth.css";

export default function AuthLayout() {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <Outlet />
      </div>
    </div>
  );
}
