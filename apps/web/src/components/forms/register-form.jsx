// apps/web/src/components/forms/register-form.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

const regSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  skills: z.string().min(2, "Add at least one skill"),
  bio: z.string().max(160, "Keep it short and sweet"),
});

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(regSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // Logic for redirecting or showing success can go here
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      {/* Show API Error Alert if registration fails */}
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {mutation.error.response?.data?.message ||
              "Registration failed. Try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register("name")}
            /* Removed hardcoded bg/border to let shadcn handle themes */
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-[10px] text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-[10px] text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Input
          id="skills"
          {...register("skills")}
          placeholder="React, Node, TypeScript"
        />
        {errors.skills && (
          <p className="text-[10px] text-destructive">
            {errors.skills.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Short Bio</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          placeholder="Tell us about your developer journey..."
          className="resize-none"
        />
        {errors.bio && (
          <p className="text-[10px] text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-[10px] text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};
