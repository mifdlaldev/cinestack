import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TmdbMovie } from "@/types/tmdb";
import { MovieCard } from "./MovieCard";

interface MovieRowProps {
  title: string;
  movies: TmdbMovie[];
  href?: string;
}

export function MovieRow({ title, movies, href }: MovieRowProps) {
  return (
    <section>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-text md:text-2xl">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="group flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
          >
            View All
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll row */}
      <div className="-mx-4 overflow-x-auto px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-4 sm:gap-5">
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              className="w-[160px] flex-shrink-0 sm:w-[180px] md:w-[200px]"
            >
              <MovieCard movie={movie} priority={i < 5} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
