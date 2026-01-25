// apps/web/src/app/auth/reset-password.jsx
import { useParams } from "react-router-dom";
import { AuthCard } from "@/components/ui/auth-card";
import { ResetForm } from "@/components/forms/reset-form";

export default function ResetPasswordPage() {
  const { token } = useParams();
  return (
    <AuthCard
      title="New Password"
      description="Enter your new secure password."
    >
      <ResetForm token={token} />
    </AuthCard>
  );
}
