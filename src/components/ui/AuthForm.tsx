"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
          <Label htmlFor="name">
            Full name
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              className="pl-10"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-error">{errors.name.message}</p>
          )}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="pl-10"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-error">{errors.email.message}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="pl-10"
            aria-invalid={!!errors.password}
            {...register("password")}
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
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting
          ? isLogin
            ? "Signing in\u2026"
            : "Creating account\u2026"
          : isLogin
            ? "Sign in"
            : "Create account"}
      </Button>

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
