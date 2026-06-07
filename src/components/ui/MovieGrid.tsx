"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TmdbMovie, TmdbWatchProvider } from "@/types/tmdb";
import { MovieCard } from "./MovieCard";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

interface MovieGridProps {
  movies: TmdbMovie[];
  isLoading?: boolean;
  providersMap?: Record<number, TmdbWatchProvider[]>;
}

export function MovieGrid({ movies, isLoading, providersMap }: MovieGridProps) {
  const shouldReduceMotion = useReducedMotion();

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
    <motion.div
      className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      initial={shouldReduceMotion ? undefined : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.04,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {movies.map((movie, i) => (
        <motion.div
          key={movie.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          <MovieCard movie={movie} priority={i < 10} providers={providersMap?.[movie.id]} />
        </motion.div>
      ))}
    </motion.div>
  );
}
