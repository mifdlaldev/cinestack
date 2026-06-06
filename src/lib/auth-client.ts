/**
 * Client-side auth helpers.
 * Safe to import from Client Components — only uses the browser
 * Supabase client, never next/headers or next/cache.
 */

import { createClient } from "./supabase-client";

export type AuthResult = {
  error?: string;
  data?: unknown;
};

/**
 * Sign up with email and password.
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { data: { email, name } };
}

/**
 * Sign in with email and password.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data: { email } };
}

/**
 * Sign in with Google OAuth.
 * Redirects the browser to Supabase OAuth URL.
 */
export async function signInWithGoogle(
  redirectTo?: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${redirectTo ?? "/"}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}
