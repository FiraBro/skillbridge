// apps/web/src/components/forms/login-form.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const { setAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      console.log("Sending login request with:", data);
      const res = await authApi.login(data); // Axios call
      console.log("API response:", res.data);
      return res.data; // Only return the data for onSuccess
    },
    onSuccess: (data) => {
      console.log("Login success data:", data);

      // Correct destructuring
      const { user, token } = data.data || {};
      if (!user || !token) {
        console.error("User or token missing!");
        return;
      }

      setAuth(user, token);
      console.log("Auth state updated, redirecting...");
      window.location.href = "/dashboard";
    },

    onError: (err) => {
      console.error("Login error:", err.response || err);
    },
  });

  return (
    <div className="auth-card">
      <div className="auth-header">
        <a href="/" className="brand-logo">
          SKILL<span>BRIDGE</span>
        </a>
        <h1>Welcome back</h1>
        <p>Elevate your career with verified expertise.</p>
      </div>

      {mutation.isError && (
        <div className="message error">
          {mutation.error?.response?.data?.message ||
            "Authentication failed. Please check your credentials."}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        id="login-form"
        className="space-y-4"
      >
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className={`btn-primary ${mutation.isLoading ? "loading" : ""}`}
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};
