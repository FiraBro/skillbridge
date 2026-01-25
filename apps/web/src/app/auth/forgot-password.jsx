// apps/web/src/app/auth/forgot-password.jsx
import { useState } from "react";
import { AuthCard } from "@/components/ui/auth-card";
import { VerificationAlert } from "@/components/ui/verification-alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthCard
      title="Recover Password"
      description="We'll send a link to your email."
      footer={<a href="/auth/login">Return to Login</a>}
    >
      {sent ? (
        <VerificationAlert
          title="Check your inbox"
          message="Reset instructions sent."
        />
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="name@dev.com"
            className="bg-slate-800 border-slate-700"
          />
          <Button onClick={() => setSent(true)} className="w-full bg-blue-600">
            Send Reset Link
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
