import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TmdbMovie, TmdbWatchProvider } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { MovieProviderStrip } from "@/components/ui/MovieProviderStrip";


interface MovieCardProps {
  movie: TmdbMovie;
  priority?: boolean;
  providers?: TmdbWatchProvider[];
}

export function MovieCard({ movie, priority = false, providers }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average.toFixed(1);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block rounded-xl transition-all duration-500 hover:scale-[1.03]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-surface">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 20vw, 250px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <span className="text-center text-sm text-text-secondary">
              {movie.title}
            </span>
          </div>
        )}

        {/* Rating badge */}
        <Badge variant="secondary" className="absolute left-2 top-2 flex items-center gap-1 bg-bg/80 backdrop-blur-sm text-accent text-xs font-semibold">
          <Star className="size-3 fill-accent text-accent" />
          {rating}
        </Badge>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-1 text-sm font-medium leading-tight text-text transition-colors group-hover:text-accent">
          {movie.title}
        </h3>
        {year && (
          <p className="text-xs text-text-secondary">{year}</p>
        )}
      </div>

      {/* Streaming provider strip */}
      <div className="mt-2">
        <MovieProviderStrip flatrate={providers ?? []} />
      </div>
    </Link>
  );
}
