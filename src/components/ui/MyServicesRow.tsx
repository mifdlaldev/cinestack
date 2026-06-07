"use client";

import { useQuery } from "@tanstack/react-query";
import type { TmdbPaginatedResponse, TmdbMovie } from "@/types/tmdb";
import { useServicesStore } from "@/stores/services-store";
import { MovieRow } from "./MovieRow";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

async function fetchByProviders(
  providerIds: number[],
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const params = new URLSearchParams({
    providerIds: providerIds.join(","),
    page: "1",
  });
  const res = await fetch(`/api/movies/by-providers?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch movies by providers");
  const json = await res.json();
  return json.data;
}

export function MyServicesRow() {
  const { selectedProviders } = useServicesStore();

  const { data, isLoading } = useQuery({
    queryKey: ["my-services-movies", selectedProviders],
    queryFn: () => fetchByProviders(selectedProviders),
    enabled: selectedProviders.length > 0,
    staleTime: 300_000, // 5 minutes
  });

  if (selectedProviders.length === 0) return null;

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-4 font-display text-xl text-text md:text-2xl">
          Available on Your Services
        </h2>
        <div className="flex gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-[160px] flex-shrink-0 sm:w-[180px] md:w-[200px]"
            >
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.results.length === 0) return null;

  return (
    <MovieRow
      title="Available on Your Services"
      movies={data.results.slice(0, 16)}
    />
  );
}
