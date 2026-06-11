"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { getImageUrl } from "@/lib/tmdb";
import type { TmdbMovie } from "@/types/tmdb";

interface SimilarMoviesSectionProps {
  movieId: number;
  initialMovies: TmdbMovie[];
}

function SimilarMovieCard({ movie }: { movie: TmdbMovie }) {
  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl text-text-secondary/20">?</span>
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-bg/80 px-2 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
          <span className="text-accent">★</span>
          {rating}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-text transition-colors group-hover:text-accent">
          {movie.title}
        </h3>
        {year && <p className="text-xs text-text-secondary">{year}</p>}
      </div>
    </Link>
  );
}

export function SimilarMoviesSection({
  movieId,
  initialMovies,
}: SimilarMoviesSectionProps) {
  const [movies, setMovies] = useState<TmdbMovie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/movies/similar?movieId=${movieId}&page=${nextPage}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      const newMovies: TmdbMovie[] = json.data;

      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => [...prev, ...newMovies]);
        setPage(nextPage);
        if (newMovies.length < 20) setHasMore(false);
      }
    } catch {
      setError("Failed to load more movies");
    } finally {
      setLoading(false);
    }
  }, [loading, page, movieId]);



  if (movies.length === 0) return null;

  return (
    <AnimatedSection>
      <section>
        <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
          Similar Movies
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((sMovie) => (
            <SimilarMovieCard key={sMovie.id} movie={sMovie} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-error">{error}</p>
        )}
      </section>
    </AnimatedSection>
  );
}
