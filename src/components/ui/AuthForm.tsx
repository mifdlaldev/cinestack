"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// ── Zod schemas ──────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Union type used as the generic for useForm.
 * Both schemas share "email" / "password"; "name" is optional so TS
 * allows register("name") even when the login schema is active.
 * The resolver still validates only the active schema's fields.
 */
type FormValues = LoginInput & Partial<Pick<RegisterInput, "name">>;

// ── Types ─────────────────────────────────────────────────────

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

// ── Component ─────────────────────────────────────────────────

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [serverError, setServerError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : registerSchema;

  // Cast resolver to FormValues so register("name") is allowed in JSX.
  // At runtime the active schema still validates the correct fields.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as import("react-hook-form").Resolver<FormValues>,
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const supabase = createClient();

    let error;
    if (isLogin) {
      const result = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      error = result.error;
    } else {
      const result = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name ?? data.email.split("@")[0],
          },
        },
      });
      error = result.error;
    }

    if (error) {
      setServerError(error.message);
      return;
    }

    // Successful auth — redirect client-side
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name field — register only */}
      {!isLogin && (
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text"
          >
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              id="name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              {...register("name")}
              className={cn(
                "w-full rounded-lg border bg-bg-alt py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50",
                errors.name
                  ? "border-error"
                  : "border-border hover:border-text-secondary/30",
              )}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-error">{errors.name.message}</p>
          )}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
            className={cn(
              "w-full rounded-lg border bg-bg-alt py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50",
              errors.email
                ? "border-error"
                : "border-border hover:border-text-secondary/30",
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-error">{errors.email.message}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            {...register("password")}
            className={cn(
              "w-full rounded-lg border bg-bg-alt py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50",
              errors.password
                ? "border-error"
                : "border-border hover:border-text-secondary/30",
            )}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-error">{errors.password.message}</p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3">
          <p className="text-sm text-error">{serverError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting
          ? isLogin
            ? "Signing in\u2026"
            : "Creating account\u2026"
          : isLogin
            ? "Sign in"
            : "Create account"}
      </button>

      {/* Switch mode link */}
      <p className="text-center text-sm text-text-secondary">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
