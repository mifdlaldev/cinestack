// ─────────────────────────────────────────────────────────────
// useMovieSearch — Debounced TMDB Search via TanStack Query
// ─────────────────────────────────────────────────────────────

"use client";

import { useQuery } from "@tanstack/react-query";
import type { TmdbMovie, TmdbPaginatedResponse } from "@/types/tmdb";

interface SearchResult {
  data: TmdbPaginatedResponse<TmdbMovie>;
}

interface SearchError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Custom hook for debounced movie search.
 * Queries /api/movies/search?q=...&page=...
 * Returns { data, isLoading, isError, error }
 */
export function useMovieSearch(query: string, page: number = 1) {
  const trimmed = query.trim();

  return useQuery<TmdbPaginatedResponse<TmdbMovie>, Error>({
    queryKey: ["movie-search", trimmed, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: trimmed,
        page: String(page),
      });

      const response = await fetch(`/api/movies/search?${params}`);

      if (!response.ok) {
        const body = (await response.json()) as SearchError;
        throw new Error(
          body.error?.message ?? `Search failed (${response.status})`,
        );
      }

      const result = (await response.json()) as SearchResult;
      return result.data;
    },
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
