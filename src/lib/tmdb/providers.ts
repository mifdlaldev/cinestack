import { fetchFromTmdb } from "./client";
import type { TmdbMovie, TmdbWatchProvider } from "@/types/tmdb";

interface ProviderResponse {
  results: TmdbWatchProvider[];
}

export async function getWatchProviders(region = "US"): Promise<ProviderResponse> {
  return fetchFromTmdb<ProviderResponse>("/watch/providers/movie", {
    params: { language: "en-US", watch_region: region },
  });
}

export async function getWatchProviderList(watchRegion = "US"): Promise<TmdbWatchProvider[]> {
  const data = await fetchFromTmdb<ProviderResponse>("/watch/providers/movie", {
    params: { language: "en-US", watch_region: watchRegion },
  });
  return data.results;
}
