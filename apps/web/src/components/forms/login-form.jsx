// apps/web/src/components/forms/login-form.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const mutation = useMutation({ mutationFn: authApi.login });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          {/* Changed text-slate-500 to text-muted-foreground */}
          <HiOutlineMail className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            id="email"
            {...register("email")}
            /* REMOVED: bg-slate-800 border-slate-700 
               ADDED: Standard shadcn classes that respond to the .dark class
            */
            className="pl-10"
            placeholder="name@company.com"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <HiOutlineLockClosed className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            {...register("password")}
            className="pl-10"
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        disabled={mutation.isPending}
        /* Uses 'primary' variable which adapts via CSS variables */
        className="w-full"
      >
        {mutation.isPending ? "Connecting..." : "Sign In"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        /* Standard outline variant handles borders automatically in light/dark */
        className="w-full"
        onClick={authApi.github}
      >
        <FaGithub className="mr-2" /> Continue with GitHub
      </Button>
    </form>
  );
};
