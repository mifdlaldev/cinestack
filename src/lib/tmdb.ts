// ─────────────────────────────────────────────────────────────
// TMDB API Service
// ─────────────────────────────────────────────────────────────

import type {
  TmdbCredit,
  TmdbGenre,
  TmdbMovieDetail,
  TmdbMovie,
  TmdbPaginatedResponse,
  TmdbPerson,
  TmdbPersonCredits,
  TmdbPersonDetail,
  TmdbVideos,
  TmdbWatchProvider,
  TmdbWatchProviders,
} from "@/types/tmdb";
import { redis, redisAvailable } from "@/lib/redis";

// ─── Configuration ──────────────────────────────────────────

const TMDB_BASE_URL =
  process.env.TMDB_API_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new TmdbApiError(
      "TMDB_API_KEY environment variable is not set",
      "MISSING_API_KEY",
    );
  }
  return key;
}

function getReadToken(): string | undefined {
  return process.env.TMDB_READ_ACCESS_TOKEN;
}

// ─── Error class ─────────────────────────────────────────────

export class TmdbApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number | undefined;

  constructor(
    message: string,
    code: string = "UNKNOWN",
    statusCode?: number,
  ) {
    super(message);
    this.name = "TmdbApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ─── Fetch helper ────────────────────────────────────────────

interface FetchOptions {
  /** Next.js ISR revalidation interval in seconds. */
  revalidate?: number;
  /** Additional query-string parameters. */
  params?: Record<string, string>;
}

async function fetchFromTmdb<T>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  const MAX_RETRIES = 3;

  // Build URL & common configuration (outside retry loop for efficiency).
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  // Authentication: prefer bearer token over API key query param.
  const token = getReadToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    url.searchParams.set("api_key", getApiKey());
  }

  // Append extra query parameters.
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  // ── Redis cache: check before hitting TMDB ────────────────
  const ttl = options?.revalidate ?? 3600;
  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(options?.params ?? {})}`;

  if (redisAvailable && redis) {
    try {
      const cached = await redis.get<string>(cacheKey);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis error — fall through to TMDB fetch
    }
  }

  // Build the Next.js fetch cache config (shared across retries).
  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {};
  if (options?.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate };
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Each attempt gets its own abort controller & timeout.
    const controller = new AbortController();
    // Increased from 10s to 30s — TMDB can be slow under load.
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          ...headers,
        },
        next: fetchOptions.next,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        try {
          const data = (await response.json()) as T;
          // Store in Redis cache (non-blocking — fire & forget)
          if (redisAvailable && redis) {
            redis.set(cacheKey, JSON.stringify(data), { ex: ttl }).catch(() => {});
          }
          return data;
        } catch {
          const text = await response.text().catch(() => "");
          throw new TmdbApiError(
            `TMDB returned empty or invalid JSON: ${text.slice(0, 200)}`,
            "INVALID_RESPONSE",
            response.status,
          );
        }
      }

      // ── 429 Rate Limit — backoff & retry ─────────────────────
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") ?? "2",
          10,
        );
        const waitTime = retryAfter * 1000 * Math.pow(2, attempt);
        console.warn(
          `[TMDB] Rate limited on ${endpoint}. ` +
            `Retry ${attempt + 1}/${MAX_RETRIES} after ${waitTime}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // ── Non-429 errors — throw immediately ──────────────────
      const body = await response.text().catch(() => "");
      throw new TmdbApiError(
        `TMDB API responded with ${response.status}: ${body || response.statusText}`,
        "API_ERROR",
        response.status,
      );
    } catch (error) {
      clearTimeout(timeout);

      // TmdbApiError from the non-429 path should propagate.
      if (error instanceof TmdbApiError) {
        throw error;
      }

      // Network / abort / transient errors — retry if attempts remain.
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = 1000 * Math.pow(2, attempt);
        console.warn(
          `[TMDB] Error on ${endpoint}. ` +
            `Retry ${attempt + 1}/${MAX_RETRIES} after ${waitTime}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw new TmdbApiError(
        `Failed to fetch TMDB: ${error instanceof Error ? error.message : "Unknown error"}`,
        "NETWORK_ERROR",
      );
    }
  }

  // All retries exhausted.
  throw new TmdbApiError("Max retries exhausted", "MAX_RETRIES");
}

import { cache } from "react";

// ─── Image URL helpers ──────────────────────────────────────

type PosterSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780";
type BackdropSize = "w300" | "w780" | "w1280" | "original";
type LogoSizes = "w45" | "w92" | "w154" | "w185" | "w300" | "w500";
type ProfileSize = "w45" | "w185" | "h632" | "original";

/**
 * Build a full TMDB image URL for a poster path.
 * Returns `null` when the path is `null`.
 */
export function getImageUrl(
  path: string | null,
  size: PosterSize = "w500",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Build a full TMDB image URL for a backdrop path.
 * Returns `null` when the path is `null`.
 */
export function getBackdropUrl(
  path: string | null,
  size: BackdropSize = "original",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Build a full TMDB image URL for a logo path.
 * Returns `null` when the path is `null`.
 */
export function getLogoUrl(
  path: string | null,
  size: LogoSizes = "w185",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Build a full TMDB image URL for a profile (actor) path.
 * Returns `null` when the path is `null`.
 */
export function getProfileUrl(
  path: string | null,
  size: ProfileSize = "w185",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// ─── Movie list endpoints ────────────────────────────────────

const DEFAULT_REVALIDATE = 3_600; // 1 hour

/**
 * Fetch currently trending movies for the given time window.
 * @param timeWindow - "day" or "week" (default: "week")
 * @param page - Page number (default: 1)
 */
export function getTrending(
  timeWindow: "day" | "week" = "week",
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(
    `/trending/movie/${timeWindow}`,
    {
      revalidate: DEFAULT_REVALIDATE,
      params: page ? { page: String(page) } : undefined,
    },
  );
}

/**
 * Fetch popular movies.
 * @param page - Page number (default: 1)
 */
export function getPopular(
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/popular", {
    revalidate: DEFAULT_REVALIDATE,
    params: page ? { page: String(page) } : undefined,
  });
}

/**
 * Fetch top-rated movies.
 * @param page - Page number (default: 1)
 */
export function getTopRated(
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/top_rated", {
    revalidate: DEFAULT_REVALIDATE,
    params: page ? { page: String(page) } : undefined,
  });
}

/**
 * Fetch upcoming movies.
 * @param page - Page number (default: 1)
 */
export function getUpcoming(
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/upcoming", {
    revalidate: DEFAULT_REVALIDATE,
    params: page ? { page: String(page) } : undefined,
  });
}

/**
 * Fetch now-playing movies.
 * @param page - Page number (default: 1)
 */
export function getNowPlaying(
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/now_playing",
    {
      revalidate: DEFAULT_REVALIDATE,
      params: page ? { page: String(page) } : undefined,
    },
  );
}

// ─── Movie detail ────────────────────────────────────────────

/**
 * Fetch full detail for a single movie.
 * @param movieId - TMDB movie ID
 */
export function getMovieDetail(
  movieId: number,
): Promise<TmdbMovieDetail> {
  return fetchFromTmdb<TmdbMovieDetail>(`/movie/${movieId}`, {
    revalidate: DEFAULT_REVALIDATE,
  });
}

// ─── Credits, videos, watch providers ────────────────────────

/**
 * Fetch cast and crew for a movie.
 * @param movieId - TMDB movie ID
 */
export function getMovieCredits(
  movieId: number,
): Promise<TmdbCredit> {
  return fetchFromTmdb<TmdbCredit>(`/movie/${movieId}/credits`, {
    revalidate: DEFAULT_REVALIDATE,
  });
}

/**
 * Fetch videos (trailers, teasers, etc.) for a movie.
 * @param movieId - TMDB movie ID
 */
export function getMovieVideos(
  movieId: number,
): Promise<TmdbVideos> {
  return fetchFromTmdb<TmdbVideos>(`/movie/${movieId}/videos`, {
    revalidate: DEFAULT_REVALIDATE,
  });
}

/**
 * Fetch streaming / purchase / rental providers for a movie.
 * @param movieId - TMDB movie ID
 */
export function getMovieWatchProviders(
  movieId: number,
): Promise<TmdbWatchProviders> {
  return fetchFromTmdb<TmdbWatchProviders>(
    `/movie/${movieId}/watch/providers`,
    { revalidate: DEFAULT_REVALIDATE },
  );
}

// ─── Search ──────────────────────────────────────────────────

/**
 * Search for movies by query string.
 * @param query - Search query
 * @param page - Page number (default: 1)
 */
export function searchMovies(
  query: string,
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const params: Record<string, string> = { query };
  if (page) params.page = String(page);
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/search/movie", {
    revalidate: 300, // 5 minutes — search results change faster
    params,
  });
}

// ─── Discover ────────────────────────────────────────────────

export interface DiscoverParams {
  genreId?: number;
  year?: number;
  sortBy?: string;
  page?: number;
  providerIds?: number[];
  watchRegion?: string;
}

/**
 * Discover movies filtered by genre, year, sort order, watch providers, etc.
 */
export function discoverMovies(
  params?: DiscoverParams,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const queryParams: Record<string, string> = {};
  if (params?.genreId) queryParams.with_genres = String(params.genreId);
  if (params?.year) queryParams.primary_release_year = String(params.year);
  if (params?.sortBy) queryParams.sort_by = params.sortBy;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.providerIds && params.providerIds.length > 0) {
    queryParams.with_watch_providers = params.providerIds.join("|");
    queryParams.watch_region = params.watchRegion ?? "US";
  }
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/discover/movie", {
    revalidate: DEFAULT_REVALIDATE,
    params: queryParams,
  });
}

// ─── Genres ──────────────────────────────────────────────────

interface TmdbGenreList {
  genres: TmdbGenre[];
}

/**
 * Fetch the full list of movie genres.
 */
export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const data = await fetchFromTmdb<TmdbGenreList>("/genre/movie/list", {
    revalidate: 86_400, // 24 hours — genres rarely change
  });
  return data.genres;
}

// ─── Watch Providers (Streaming Services) ───────────────────

interface TmdbWatchProviderListResult {
  results: TmdbWatchProvider[];
}

/**
 * Fetch the list of available streaming providers for movies.
 * @param watchRegion - ISO 3166-1 alpha-2 country code (default: "US")
 */
export async function getWatchProviderList(
  watchRegion: string = "US",
): Promise<TmdbWatchProvider[]> {
  const data = await fetchFromTmdb<TmdbWatchProviderListResult>(
    "/watch/providers/movie",
    {
      revalidate: 86_400, // 24 hours — provider list rarely changes
      params: { language: "en-US", watch_region: watchRegion },
    },
  );
  return data.results;
}

// ─── Similar / Recommendations ──────────────────────────────

/**
 * Fetch movies similar to the given movie.
 * @param movieId - TMDB movie ID
 * @param page - Page number (default: 1)
 */
export function getSimilarMovies(
  movieId: number,
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(
    `/movie/${movieId}/similar`,
    {
      revalidate: DEFAULT_REVALIDATE,
      params: page ? { page: String(page) } : undefined,
    },
  );
}

/**
 * Fetch recommended movies for the given movie.
 * @param movieId - TMDB movie ID
 * @param page - Page number (default: 1)
 */
export function getRecommendedMovies(
  movieId: number,
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(
    `/movie/${movieId}/recommendations`,
    {
      revalidate: DEFAULT_REVALIDATE,
      params: page ? { page: String(page) } : undefined,
    },
  );
}

// ─── Trending actors ─────────────────────────────────────────

/**
 * Fetch trending actors / people for the given time window.
 * @param timeWindow - "day" or "week" (default: "week")
 * @param page - Page number (default: 1)
 */
export function getTrendingActors(
  timeWindow: "day" | "week" = "week",
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbPerson>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbPerson>>(
    `/trending/person/${timeWindow}`,
    {
      revalidate: DEFAULT_REVALIDATE,
      params: page ? { page: String(page) } : undefined,
    },
  );
}

/**
 * Search for actors/people by name.
 * @param query - Search query string
 * @param page - Page number (default: 1)
 */
export function searchActors(
  query: string,
  page?: number,
): Promise<TmdbPaginatedResponse<TmdbPerson>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbPerson>>("/search/person", {
    revalidate: 300, // 5 minutes — search results change faster
    params: {
      query,
      ...(page ? { page: String(page) } : {}),
    },
  });
}

// ─── Person / Actor endpoints ──────────────────────────────────

/**
 * Fetch full detail for a single person (actor / crew).
 * @param personId - TMDB person ID
 */
export function getPersonDetail(
  personId: number,
): Promise<TmdbPersonDetail> {
  return fetchFromTmdb<TmdbPersonDetail>(`/person/${personId}`, {
    revalidate: DEFAULT_REVALIDATE,
  });
}

/**
 * Fetch movie credits (cast + crew) for a person.
 * @param personId - TMDB person ID
 */
export function getPersonMovieCredits(
  personId: number,
): Promise<TmdbPersonCredits> {
  return fetchFromTmdb<TmdbPersonCredits>(
    `/person/${personId}/movie_credits`,
    { revalidate: DEFAULT_REVALIDATE },
  );
}

/**
 * Cached version of `getTrending("week")` to avoid duplicate TMDB calls.
 * Deduplicates requests within the same render pass via React's `cache()`.
 */
export const getTrendingCached = cache(() => getTrending("week"));

// Re-export types for convenience.
export type {
  TmdbCredit,
  TmdbGenre,
  TmdbMovieDetail,
  TmdbMovie,
  TmdbPaginatedResponse,
  TmdbPerson,
  TmdbPersonCredits,
  TmdbPersonDetail,
  TmdbVideos,
  TmdbWatchProviders,
} from "@/types/tmdb";
