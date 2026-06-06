// ─────────────────────────────────────────────────────────────
// Search Page — Debounced movie search with grid results
// ─────────────────────────────────────────────────────────────

"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { useMovieSearch } from "@/hooks/useMovieSearch";
import { getImageUrl } from "@/lib/tmdb";
import type { TmdbMovie } from "@/types/tmdb";

function MovieCard({ movie }: { movie: TmdbMovie }) {
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const rating = movie.vote_average.toFixed(1);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-alt">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-12 w-12 text-text-secondary/30" />
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-bg/80 px-2 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
          <span className="text-accent">★</span>
          {rating}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-text group-hover:text-accent transition-colors">
          {movie.title}
        </h3>
        {year && (
          <p className="text-xs text-text-secondary">{year}</p>
        )}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8 md:py-12">
        <div className="mb-8">
          <div className="mb-2 h-10 w-48 animate-pulse rounded bg-surface" />
          <div className="h-5 w-72 animate-pulse rounded bg-surface" />
        </div>
        <div className="mb-8 h-14 animate-pulse rounded-xl bg-surface" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="aspect-[2/3] animate-pulse bg-surface-hover" />
              <div className="p-3">
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") ?? "";
  const initialPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, isError, error } = useMovieSearch(query, page);

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      setPage(1);
      router.replace(
        newQuery.trim()
          ? `/search?q=${encodeURIComponent(newQuery.trim())}`
          : "/search",
        { scroll: false },
      );
    },
    [router],
  );

  const totalPages = useMemo(
    () => Math.min(data?.total_pages ?? 0, 500),
    [data?.total_pages],
  );

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      const next = page - 1;
      setPage(next);
      if (query.trim()) {
        router.replace(
          `/search?q=${encodeURIComponent(query.trim())}&page=${next}`,
          { scroll: false },
        );
      }
    }
  }, [page, query, router]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      if (query.trim()) {
        router.replace(
          `/search?q=${encodeURIComponent(query.trim())}&page=${next}`,
          { scroll: false },
        );
      }
    }
  }, [page, totalPages, query, router]);

  const showResults = query.trim().length >= 2;
  const noResults = showResults && !isLoading && !isError && data && data.results.length === 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl tracking-tight text-text md:text-4xl">
          Search Movies
        </h1>
        <p className="text-text-secondary">
          Find your favorite movies, actors, and more
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <SearchBar
          value={query}
          onSearch={handleSearch}
          placeholder="Search by title..."
        />
      </div>

      {/* Empty state (no query) */}
      {!showResults && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <SearchIcon className="mb-4 h-16 w-16 text-text-secondary/20" />
          <h2 className="mb-2 text-xl font-semibold text-text">
            Find your next watch
          </h2>
          <p className="max-w-md text-text-secondary">
            Type at least 2 characters to search through thousands of movies
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && showResults && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="aspect-[2/3] animate-pulse bg-surface-hover" />
              <div className="p-3">
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && showResults && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="mb-2 text-lg font-semibold text-error">
            Failed to load results
          </p>
          <p className="text-text-secondary">
            {error instanceof Error ? error.message : "An unexpected error occurred. Please try again."}
          </p>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Film className="mb-4 h-16 w-16 text-text-secondary/20" />
          <h2 className="mb-2 text-xl font-semibold text-text">
            No movies found
          </h2>
          <p className="max-w-md text-text-secondary">
            We couldn&apos;t find any movies matching &quot;{query}&quot;. Try a different search term.
          </p>
        </div>
      )}

      {/* Results grid */}
      {data && data.results.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Found {data.total_results.toLocaleString()} results
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
