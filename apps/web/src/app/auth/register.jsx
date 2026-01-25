// apps/web/src/app/auth/register.jsx
import { AuthCard } from "@/components/ui/auth-card";
import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Build your Profile"
      description="Connect with developers worldwide."
      footer={
        <a href="/auth/login" className="text-blue-400">
          Already a member?
        </a>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
