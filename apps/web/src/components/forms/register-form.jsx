import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { BrandLogo } from "../comman/BrandLogo";
import { useNavigate } from "react-router-dom";

// 1. Schema aligned with Router ROLES
const regSchema = z
  .object({
    role: z.enum(["developer", "company"]), // Changed from 'client' to 'company'
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
  const navigate = useNavigate();
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

      // Save user to Auth Context
      setAuth(user, token);

      // 2. Dynamic Redirect: Send users to the correct dashboard
      if (user.role === "company") {
        navigate("/app/company-dashboard");
      } else {
        navigate("/app/dashboard");
      }
    },
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setValue("role", newRole);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <BrandLogo className="brand-logo" />
        <h1>Create account</h1>
        <p>Join the next generation of verified talent.</p>
      </div>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          {mutation.error.response?.data?.message ||
            "Registration failed. Please try again."}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        id="register-form"
      >
        <div className="form-group">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            I want to join as a...
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Developer Option */}
            <div
              className={`cursor-pointer p-4 border-2 rounded-2xl transition-all ${
                role === "developer"
                  ? "border-blue-600 bg-blue-50/50 shadow-sm"
                  : "border-gray-100 hover:border-gray-200"
              }`}
              onClick={() => handleRoleChange("developer")}
            >
              <div className="text-2xl mb-1">💻</div>
              <div className="font-bold text-gray-900">Developer</div>
              <div className="text-xs text-gray-500">Looking for work</div>
            </div>

            {/* Company Option - Matches Router ROLES.COMPANY */}
            <div
              className={`cursor-pointer p-4 border-2 rounded-2xl transition-all ${
                role === "company"
                  ? "border-blue-600 bg-blue-50/50 shadow-sm"
                  : "border-gray-100 hover:border-gray-200"
              }`}
              onClick={() => handleRoleChange("company")}
            >
              <div className="text-2xl mb-1">🏢</div>
              <div className="font-bold text-gray-900">Company</div>
              <div className="text-xs text-gray-500">Hiring talent</div>
            </div>
          </div>
          <input type="hidden" {...register("role")} />
        </div>

        {/* Full Name */}
        <div className="form-group mt-6">
          <label
            htmlFor="name"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Full Name
          </label>
          <input
            id="name"
            className={`w-full p-3 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-200 focus:border-blue-500"} outline-none transition-all`}
            type="text"
            {...register("name")}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="form-group mt-4">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Email Address
          </label>
          <input
            id="email"
            className={`w-full p-3 rounded-xl border ${errors.email ? "border-red-500" : "border-gray-200 focus:border-blue-500"} outline-none transition-all`}
            type="email"
            {...register("email")}
            placeholder="name@company.com"
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="form-group mt-4">
          <label
            htmlFor="password"
            title="Password"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Password
          </label>
          <input
            id="password"
            className={`w-full p-3 rounded-xl border ${errors.password ? "border-red-500" : "border-gray-200 focus:border-blue-500"} outline-none transition-all`}
            type="password"
            {...register("password")}
            placeholder="Min. 8 characters"
          />
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group mt-4">
          <label
            htmlFor="confirmPassword"
            title="Confirm Password"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            className={`w-full p-3 rounded-xl border ${errors.confirmPassword ? "border-red-500" : "border-gray-200 focus:border-blue-500"} outline-none transition-all`}
            type="password"
            {...register("confirmPassword")}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] ${mutation.isPending ? "opacity-70" : ""}`}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="auth-footer mt-6 text-center text-sm text-gray-500">
        Already using Skillbridge?{" "}
        <a
          href="/auth/login"
          className="text-blue-600 font-bold hover:underline"
        >
          Sign In
        </a>
      </div>
    </div>
  );
};
