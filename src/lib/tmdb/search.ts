import { fetchFromTmdb } from "./client";
import type { TmdbMovie, TmdbPaginatedResponse } from "@/types/tmdb";

export interface DiscoverParams {
  genre?: string;
  genreId?: string;
  year?: string;
  ratingMin?: string;
  ratingMax?: string;
  sortBy?: string;
  page?: number;
  providers?: string;
  providerIds?: string;
  watchRegion?: string;
}

export async function searchMovies(query: string, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/search/movie", {
    params: { query, page: page.toString() },
  });
}

export async function discoverMovies(params: DiscoverParams): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const queryParams: Record<string, string> = { page: (params.page ?? 1).toString() };
  if (params.genre) queryParams.with_genres = params.genre;
  if (params.year) queryParams.primary_release_year = params.year;
  if (params.ratingMin) queryParams["vote_average.gte"] = params.ratingMin;
  if (params.ratingMax) queryParams["vote_average.lte"] = params.ratingMax;
  if (params.sortBy) queryParams.sort_by = params.sortBy;
  if (params.providers) queryParams.with_watch_providers = params.providers;
  if (params.watchRegion) queryParams.watch_region = params.watchRegion;

  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/discover/movie", {
    params: queryParams,
  });
}
