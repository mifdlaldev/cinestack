// ─────────────────────────────────────────────────────────────
// In-memory token-bucket rate limiter
// Used in middleware.ts for API route protection
// No external dependencies — works in serverless (Vercel)
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Sweep expired entries every 60s to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 60_000);

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const defaults: Record<string, RateLimitConfig> = {
  auth:    { limit: 5,   windowMs: 15 * 60 * 1000 },  // 5 per 15 minutes
  api:     { limit: 60,  windowMs: 60 * 1000 },         // 60 per minute
  admin:   { limit: 120, windowMs: 60 * 1000 },         // 120 per minute
  default: { limit: 30,  windowMs: 60 * 1000 },         // 30 per minute
};

export function getRateLimitConfig(path: string): RateLimitConfig {
  if (path.startsWith('/api/admin/')) return defaults.admin;
  if (path.startsWith('/api/auth/')) return defaults.auth;
  if (path.startsWith('/api/')) return defaults.api;
  return defaults.default;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  // First request or expired window — start a new window
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs };
  }

  entry.count++;

  if (entry.count > config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}
