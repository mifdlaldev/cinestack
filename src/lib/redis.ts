// ─────────────────────────────────────────────────────────────
// Upstash Redis client — with graceful fallback for local dev
// When UPSTASH_REDIS_REST_URL is not set, falls back to an
// in-memory store so the app still works without Redis.
// ─────────────────────────────────────────────────────────────

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let redisAvailable = false;

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  redis = new Redis({
    url: UPSTASH_URL,
    token: UPSTASH_TOKEN,
  });
  redisAvailable = true;
}

/**
 * In-memory fallback store for local development without Redis.
 * Uses a simple Map with TTL.
 */
const memStore = new Map<string, { value: number; expiresAt: number }>();

const mem = {
  async get(key: string): Promise<number | null> {
    const entry = memStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memStore.delete(key);
      return null;
    }
    return entry.value;
  },
  async set(key: string, value: number, ttlMs: number): Promise<void> {
    memStore.set(key, { value, expiresAt: Date.now() + ttlMs });
  },
  async incr(key: string): Promise<number> {
    const entry = memStore.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      memStore.set(key, { value: 1, expiresAt: Date.now() + 60000 });
      return 1;
    }
    entry.value += 1;
    return entry.value;
  },
  async pexpire(key: string, ttlMs: number): Promise<void> {
    const entry = memStore.get(key);
    if (entry) entry.expiresAt = Date.now() + ttlMs;
  },
};

export { redis, mem, redisAvailable };
