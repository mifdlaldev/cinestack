// ─────────────────────────────────────────────────────────────
// Rate limiter — using Upstash Redis when available, in-memory
// fallback for local dev. Sliding window implementation.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { redis, mem, redisAvailable } from "@/lib/redis";

interface RateLimitConfig {
  /** Max requests allowed within the window */
  limit: number;
  /** Window duration in seconds (default: 60) */
  windowSeconds?: number;
  /** Unique identifier — typically IP + path prefix */
  identifier: string;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Sliding window rate limiter.
 * Returns whether the request is allowed plus rate limit headers.
 */
export async function checkRateLimit(
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { limit, windowSeconds = 60, identifier } = config;
  const windowMs = windowSeconds * 1000;
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  if (redisAvailable && redis) {
    // Use Redis sliding window via sorted sets
    // Clean old entries, count recent ones, add current
    const windowStart = now - windowMs;
    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    multi.zcard(key);
    multi.pexpire(key, windowMs);
    const results = await multi.exec();
    const count = (results?.[2] as number) ?? 0;

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  // In-memory fallback
  const memKey = key;
  const current = (await mem.get(memKey)) ?? 0;
  if (current === 0) {
    await mem.set(memKey, 1, windowMs);
    return { allowed: true, limit, remaining: limit - 1, reset: Math.ceil((now + windowMs) / 1000) };
  }
  await mem.incr(memKey);
  return {
    allowed: current < limit,
    limit,
    remaining: Math.max(0, limit - current),
    reset: Math.ceil((now + windowMs) / 1000),
  };
}

/**
 * Rate limit configuration presets.
 */
export const RATE_LIMITS = {
  /** Auth endpoints — strictest (5 req / 15 min) */
  auth: { limit: 5, windowSeconds: 900 },
  /** Search endpoints (30 req / 1 min) */
  search: { limit: 30, windowSeconds: 60 },
  /** General API (60 req / 1 min) */
  general: { limit: 60, windowSeconds: 60 },
  /** TMDB-related routes like discover, trending (20 req / 1 min) */
  tmdb: { limit: 20, windowSeconds: 60 },
} as const;

/**
 * Helper to extract a consistent identifier from the request.
 * Falls back to "anonymous" when IP is not available.
 */
export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "anonymous";
  return ip;
}

/**
 * Apply rate limiting to a route handler.
 * If rate limited, returns 429 with headers.
 * Otherwise returns null so the handler proceeds.
 */
export async function applyRateLimit(
  request: Request,
  config: Omit<RateLimitConfig, "identifier"> & { identifier?: string },
): Promise<NextResponse | null> {
  const identifier = config.identifier ?? getRateLimitIdentifier(request);
  const result = await checkRateLimit({ ...config, identifier });

  // If blocked, return 429
  if (!result.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((result.reset - Date.now() / 1000)))),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      },
    );
  }

  return null;
}
