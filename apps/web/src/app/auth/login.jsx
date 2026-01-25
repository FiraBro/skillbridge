// apps/web/src/app/auth/login.jsx
import { AuthCard } from "@/components/ui/auth-card";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Login to Skillbridge"
      description="Ready to build something great?"
      footer={
        <a href="/auth/register" className="text-blue-400">
          Join the community
        </a>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
