import type { TmdbMovie } from "@/types/tmdb";
import { MovieCard } from "./MovieCard";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

interface MovieGridProps {
  movies: TmdbMovie[];
  isLoading?: boolean;
}

export function MovieGrid({ movies, isLoading }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} priority={i < 10} />
      ))}
    </div>
  );
}
