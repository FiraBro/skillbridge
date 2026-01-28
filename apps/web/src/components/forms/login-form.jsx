// apps/web/src/components/forms/login-form.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      window.location.href = "/dashboard";
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
          {mutation.error.response?.data?.message ||
            "Authentication failed. Please check your credentials."}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        id="login-form"
      >
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
              placeholder="••••••••"
              required
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`btn-primary ${mutation.isPending ? "loading" : ""}`}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Sign In..." : "Sign In"}
        </button>
      </form>

      <div className="social-auth">
        <button
          type="button"
          className="btn-social"
          onClick={authApi.getGithubAuth}
          title="Sign in with GitHub"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>GitHub</title>
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </button>
        <button
          type="button"
          className="btn-social"
          title="Sign in with Google"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Google</title>
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.22-1.9 4.22-1.14 1.14-2.9 2.4-5.94 2.4-4.84 0-8.62-3.92-8.62-8.76s3.78-8.76 8.62-8.76c2.62 0 4.54 1.02 5.94 2.34l2.3-2.3c-1.92-1.84-4.5-3.3-8.24-3.3-6.84 0-12.64 5.54-12.64 12.38s5.8 12.38 12.64 12.38c3.66 0 6.44-1.2 8.58-3.4 2.22-2.22 2.92-5.34 2.92-7.82 0-.66-.06-1.28-.18-1.84H12.48z" />
          </svg>
        </button>
      </div>

      <div className="auth-footer">
        Don't have an account? <a href="/auth/register">Get Started</a>
      </div>
    </div>
  );
};
