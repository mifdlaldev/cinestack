import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, getRateLimitConfig } from '@/lib/rate-limit'

const PROTECTED_PATH_PREFIXES = ['/watchlist', '/profile', '/admin']
const PUBLIC_PREFIXES = ['/_next/static', '/_next/image', '/favicon.ico', '/api/auth', '/auth/callback']

/**
 * Returns true only for routes that need auth-aware middleware.
 * Static assets, auth endpoints, and images bypass entirely.
 */
function needsMiddleware(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/i.test(pathname)) return false
  return pathname.startsWith('/api/') || PROTECTED_PATH_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!needsMiddleware(pathname)) {
    return NextResponse.next()
  }

  // ── Rate limiting (API only) ──
  let rateLimitResult: ReturnType<typeof checkRateLimit> | null = null
  let rateLimitConfig: ReturnType<typeof getRateLimitConfig> | null = null

  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    const key = `${ip}:${pathname}`
    rateLimitConfig = getRateLimitConfig(pathname)
    rateLimitResult = checkRateLimit(key, rateLimitConfig)

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000,
      )
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(rateLimitConfig.limit),
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }
  }

  // ── Auth check (protected routes only) ──
  const isProtected = PROTECTED_PATH_PREFIXES.some((p) => pathname.startsWith(p))

  if (!isProtected) {
    // Public API routes — just apply rate limit headers and continue
    const response = NextResponse.next()
    if (rateLimitResult && rateLimitConfig) {
      response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.limit))
      response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    }
    return response
  }

  // Only reach here for protected routes — do full auth check
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (rateLimitResult && rateLimitConfig) {
    supabaseResponse.headers.set('X-RateLimit-Limit', String(rateLimitConfig.limit))
    supabaseResponse.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
