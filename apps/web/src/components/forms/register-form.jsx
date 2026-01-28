// apps/web/src/components/forms/register-form.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const regSchema = z
  .object({
    role: z.enum(["developer", "client"]),
    name: z.string().min(2, "Full name required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterForm = () => {
  const { setAuth } = useAuth();
  const [role, setRole] = useState("developer");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(regSchema),
    defaultValues: { role: "developer" },
  });

  const mutation = useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
      window.location.href = "/dashboard";
    },
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setValue("role", newRole);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <a href="/" className="brand-logo">
          SKILL<span>BRIDGE</span>
        </a>
        <h1>Create account</h1>
        <p>Join the next generation of verified talent.</p>
      </div>

      {mutation.isError && (
        <div className="message error">
          {mutation.error.response?.data?.message ||
            "Registration failed. Please try again."}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        id="register-form"
      >
        <div className="form-group">
          <label>I want to join as a...</label>
          <div className="role-selection">
            <div
              className={`role-card ${role === "developer" ? "selected" : ""}`}
              onClick={() => handleRoleChange("developer")}
            >
              <span className="role-icon">💻</span>
              <span className="role-name">Developer</span>
              <span className="role-desc">Looking for work</span>
            </div>
            <div
              className={`role-card ${role === "client" ? "selected" : ""}`}
              onClick={() => handleRoleChange("client")}
            >
              <span className="role-icon">🏢</span>
              <span className="role-name">Client</span>
              <span className="role-desc">Hiring talent</span>
            </div>
          </div>
          <input type="hidden" {...register("role")} />
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-wrapper">
            <input
              id="name"
              type="text"
              {...register("name")}
              placeholder="John Doe"
              required
            />
          </div>
          {errors.name && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="name@company.com"
              required
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Min. 8 characters"
              required
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              required
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`btn-primary ${mutation.isPending ? "loading" : ""}`}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing up..." : "Create Account"}
        </button>
      </form>

      <div className="auth-footer">
        Already using Skillbridge? <a href="/auth/login">Sign In</a>
      </div>
    </div>
  );
};
