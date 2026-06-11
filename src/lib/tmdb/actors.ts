import { fetchFromTmdb } from "./client";
import type { TmdbPaginatedResponse, TmdbPerson, TmdbPersonDetail, TmdbPersonCredits } from "@/types/tmdb";

export async function getTrendingActors(window: "day" | "week" = "week", page = 1): Promise<TmdbPaginatedResponse<TmdbPerson>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbPerson>>(`/trending/person/${window}`, {
    params: { page: page.toString() },
  });
}

export async function searchActors(query: string, page = 1): Promise<TmdbPaginatedResponse<TmdbPerson>> {
  return fetchFromTmdb<TmdbPaginatedResponse<TmdbPerson>>("/search/person", {
    params: { query, page: page.toString() },
  });
}

export async function getPersonDetail(id: number): Promise<TmdbPersonDetail> {
  return fetchFromTmdb<TmdbPersonDetail>(`/person/${id}`);
}

export async function getPersonMovieCredits(id: number): Promise<TmdbPersonCredits> {
  return fetchFromTmdb<TmdbPersonCredits>(`/person/${id}/movie_credits`);
}
