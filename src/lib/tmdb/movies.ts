import { fetchFromTmdb } from "./client";
import { cache } from "react";
import type {
  TmdbMovie, TmdbPaginatedResponse, TmdbGenre,
  TmdbMovieDetail, TmdbCredit, TmdbVideos, TmdbWatchProviders,
  TmdbCastMember, TmdbVideo,
} from "@/types/tmdb";

// ─── Trending ──────────────────────────────────────────────────

export async function getTrending(window: "day" | "week" = "week", page?: number): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(`/trending/movie/${window}`, {
    params: page ? { page: page.toString() } : undefined,
  });
}

export const getTrendingCached = cache(() => getTrending("week"));

// ─── Movie lists ───────────────────────────────────────────────

export async function getPopular(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/popular", {
    params: { page: page.toString() },
  });
}

export async function getTopRated(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/top_rated", {
    params: { page: page.toString() },
  });
}

export async function getUpcoming(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/upcoming", {
    params: { page: page.toString() },
  });
}

export async function getNowPlaying(page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>("/movie/now_playing", {
    params: { page: page.toString() },
  });
}

// ─── Movie detail ──────────────────────────────────────────────

export async function getMovieDetail(id: number): Promise<TmdbMovieDetail> {
  return fetchFromTmdb<TmdbMovieDetail>(`/movie/${id}`);
}

export async function getMovieCredits(id: number): Promise<TmdbCredit> {
  return fetchFromTmdb<TmdbCredit>(`/movie/${id}/credits`);
}

export async function getMovieVideos(id: number): Promise<TmdbVideos> {
  return fetchFromTmdb<TmdbVideos>(`/movie/${id}/videos`);
}

export async function getMovieWatchProviders(id: number): Promise<TmdbWatchProviders> {
  return fetchFromTmdb<TmdbWatchProviders>(`/movie/${id}/watch/providers`);
}

export async function getSimilarMovies(id: number, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(`/movie/${id}/similar`, {
    params: { page: page.toString() },
  });
}

export async function getRecommendedMovies(id: number, page = 1): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbMovie>>(`/movie/${id}/recommendations`, {
    params: { page: page.toString() },
  });
}

export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const data = await fetchFromTmdb<{ genres: TmdbGenre[] }>("/genre/movie/list");
  return data.genres;
}
