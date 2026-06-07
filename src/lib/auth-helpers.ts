// ─────────────────────────────────────────────────────────────
// Auth Helpers — Server Actions & Auth Utilities
//
// IMPORTANT: This file uses dynamic imports for server-only
// modules (next/cache, next/headers, next/navigation) so that
// it can be safely imported by Client Components that only
// use client-safe exports like signInWithGoogle / signInWithGoogle.
// ─────────────────────────────────────────────────────────────

export type AuthResult = {
  error?: string
  data?: unknown
}

/**
 * Sign up with email and password.
 * Server Action compatible.
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const { createClient } = await import('./supabase')
  const supabase = await createClient()

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

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')
  return { data: { email, name } }
}

/**
 * Sign in with email and password.
 * Server Action compatible.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { createClient } = await import('./supabase')
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/', 'layout')
  return { data: { email } }
}

/**
 * Sign in with Google OAuth.
 * Uses the browser client — safe to call from Client Components.
 * Returns the redirect URL for the OAuth flow.
 */
export async function signInWithGoogle(
  redirectTo?: string
): Promise<{ url: string } | { error: string }> {
  const { createClient } = await import('./supabase-client')
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

/**
 * Sign out the current user.
 * Server Action compatible.
 */
export async function signOut(): Promise<void> {
  const { createClient } = await import('./supabase')
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[auth] signOut error:', error.message)
    return
  }

  const [{ revalidatePath }, { redirect }] = await Promise.all([
    import('next/cache'),
    import('next/navigation'),
  ])
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Get the current authenticated user (server-side).
 * Uses getUser() which verifies the JWT — secure.
 */
export async function getCurrentUser() {
  const { createClient } = await import('./supabase')
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Get the current session (server-side).
 * Note: getUser() is preferred for auth checks as it verifies the JWT.
 * getSession() is useful for checking session existence without validation.
 */
export async function getSession() {
  const { createClient } = await import('./supabase')
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

/**
 * Check if the current user has admin role.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  const { createClient } = await import('./supabase')
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}
