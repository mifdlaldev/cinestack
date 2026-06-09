"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TmdbPaginatedResponse, TmdbMovie, TmdbGenre } from "@/types/tmdb";
import { MovieGrid } from "@/components/ui/MovieGrid";
import { FilterPanel, type FilterValues } from "@/components/ui/FilterPanel";

async function fetchDiscover(
  params: FilterValues & { page: number },
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const searchParams = new URLSearchParams();
  if (params.genreId) searchParams.set("genreId", String(params.genreId));
  if (params.year) searchParams.set("year", String(params.year));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.providerIds && params.providerIds.length > 0) {
    searchParams.set("providerIds", params.providerIds.join(","));
  }
  searchParams.set("page", String(params.page));

  const res = await fetch(`/api/movies/discover?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to discover movies");
  }
  const json = await res.json();
  return json.data;
}

async function fetchGenres(): Promise<TmdbGenre[]> {
  const res = await fetch("/api/movies/genres");
  if (!res.ok) {
    throw new Error("Failed to fetch genres");
  }
  const json = await res.json();
  return json.data;
}

async function fetchPopular(
  page: number,
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const searchParams = new URLSearchParams({ page: String(page) });
  const res = await fetch(`/api/movies/discover?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch popular movies");
  }
  const json = await res.json();
  return json.data;
}

export default function DiscoverPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    genreId: null,
    year: null,
    sortBy: "popularity.desc",
    providerIds: [],
  });

  // Fetch genres once
  const { data: genres = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
    staleTime: 86_400_000, // 24 hours
  });

  // Fetch movies based on filters
  const hasActiveFilters =
    filters.genreId !== null ||
    filters.year !== null ||
    filters.providerIds.length > 0;

  const {
    data: movieData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: hasActiveFilters
      ? ["discover", filters, page]
      : ["popular", page],
    queryFn: () =>
      hasActiveFilters
        ? fetchDiscover({ ...filters, page })
        : fetchPopular(page),
    placeholderData: (prev) => prev,
  });

  const handleApplyFilters = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const movies = movieData?.results ?? [];
  const totalPages = Math.min(movieData?.total_pages ?? 1, 500);
  const totalResults = movieData?.total_results ?? 0;

  const subtitle = hasActiveFilters
    ? `${totalResults.toLocaleString()} results found`
    : "Trending popular movies right now";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <header className="pt-10 mb-8">
        <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl">
          Discover
        </h1>
        <p className="mt-2 text-text-secondary">{subtitle}</p>
      </header>

      {/* Filters */}
      <div className="mb-8">
        <FilterPanel
          onApply={handleApplyFilters}
          genres={genres}
          initialValues={{
            genreId: filters.genreId ?? undefined,
            year: filters.year ?? undefined,
            sortBy: filters.sortBy,
            providerIds: filters.providerIds,
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-error/30 bg-error/5 px-6 py-12">
          <div className="text-center">
            <p className="text-lg font-medium text-error">
              Failed to load movies
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <button
              onClick={() => handleApplyFilters(filters)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <MovieGrid movies={movies} isLoading={isLoading && !movieData} />

      {/* Pagination */}
      {movies.length > 0 && totalPages > 1 && (() => {
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, page - half);
        const end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        const pages: (number | "ellipsis")[] = [];
        if (start > 1) { pages.push(1); if (start > 2) pages.push("ellipsis"); }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) { if (end < totalPages - 1) pages.push("ellipsis"); pages.push(totalPages); }

        return (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Page navigation">
            {page > 1 && (
              <button onClick={() => handlePageChange(page - 1)} className="rounded-full border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text">
                Previous
              </button>
            )}

            {pages.map((p, i) =>
              p === "ellipsis" ? (
                <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-secondary">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`rounded-full px-3 py-2 text-sm transition-colors ${
                    p === page
                      ? "bg-accent font-semibold text-bg"
                      : "text-text-secondary hover:bg-surface hover:text-text"
                  }`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}

            {page < totalPages && (
              <button onClick={() => handlePageChange(page + 1)} className="rounded-full border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text">
                Next
              </button>
            )}
          </nav>
        );
      })()}
    </div>
  );
}
