// ─────────────────────────────────────────────────────────────
// Client-Safe Auth Helpers
//
// Uses the browser Supabase client — safe to import from any
// Client Component. Does NOT import any server-only modules.
// ─────────────────────────────────────────────────────────────

import { createClient } from './supabase-client'

export type AuthResult = {
  error?: string
  data?: unknown
}

/**
 * Sign up with email and password from the client side.
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data: { email, name } }
}

/**
 * Sign in with email and password from the client side.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { data: { email } }
}

/**
 * Sign in with Google OAuth.
 * Returns the redirect URL for the OAuth flow.
 */
export async function signInWithGoogle(
  redirectTo?: string
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${redirectTo ?? '/'}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}
