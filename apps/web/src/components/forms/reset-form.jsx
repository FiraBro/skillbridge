// apps/web/src/components/forms/reset-form.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HiOutlineCheckCircle } from "react-icons/hi2";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const ResetForm = ({ token }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const mutation = useMutation({
    mutationFn: (data) => authApi.resetPassword(token, data),
  });

  // If the password was successfully reset, show a success message instead of the form
  if (mutation.isSuccess) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <HiOutlineCheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold">Password Updated</h3>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now log in with
          your new credentials.
        </p>
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/auth/login")}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {mutation.error.response?.data?.message ||
              "Link expired or invalid. Please request a new one."}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          placeholder="••••••••"
          className={errors.confirmPassword ? "border-destructive" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-xs">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
};
