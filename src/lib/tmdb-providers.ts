// ─────────────────────────────────────────────────────────────
// TMDB Watch Providers — Batch fetcher with concurrency limit
// and React.cache() deduplication.
//
// Server-only: imports React.cache() and TMDB data functions.
// ─────────────────────────────────────────────────────────────

import { cache } from "react";
import { getMovieWatchProviders } from "./tmdb";
import type { TmdbWatchProvider } from "@/types/tmdb";

/**
 * Fetch watch providers for a single movie, deduplicated within
 * the same React render pass via `React.cache()`.
 *
 * If two components request the same `movieId`, only one TMDB
 * call is actually made.
 */
const getSingleProvider = cache(
  async (movieId: number): Promise<TmdbWatchProvider[]> => {
    try {
      const data = await getMovieWatchProviders(movieId);
      const countries = Object.keys(data.results);
      const countryKey = countries.includes("US") ? "US" : countries[0];
      if (!countryKey) return [];

      const country = data.results[countryKey];
      const providers: TmdbWatchProvider[] = [
        ...(country.flatrate ?? []),
      ].filter(
        (p, i, arr) =>
          arr.findIndex((a) => a.provider_id === p.provider_id) === i,
      );

      providers.sort((a, b) => a.display_priority - b.display_priority);
      return providers;
    } catch {
      return [];
    }
  },
);

/**
 * Batch-fetch watch providers for an array of movie IDs.
 *
 * Concurrency is limited to `CHUNK_SIZE` (default 5) parallel
 * requests to avoid TMDB rate limiting. Uses `React.cache()` so
 * duplicate movieIds within the same render pass are deduplicated.
 *
 * Returns a `Record<number, TmdbWatchProvider[]>` keyed by movie ID.
 * Movies with no providers or fetch errors will have an empty array.
 */
export async function getProvidersForMovies(
  movieIds: number[],
  chunkSize: number = 5,
): Promise<Record<number, TmdbWatchProvider[]>> {
  const result: Record<number, TmdbWatchProvider[]> = {};

  // Deduplicate movie IDs to avoid redundant fetches
  const uniqueIds = [...new Set(movieIds)];

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        result[id] = await getSingleProvider(id);
      }),
    );
  }

  return result;
}
