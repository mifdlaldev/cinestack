"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Info, BookmarkPlus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TmdbMovie } from "@/types/tmdb";
import { getBackdropUrl } from "@/lib/tmdb";

interface HeroSectionProps {
  movie: TmdbMovie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average.toFixed(1);
  const overview =
    movie.overview.length > 300
      ? `${movie.overview.slice(0, 300)}...`
      : movie.overview;

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {/* Backdrop image */}
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-bg" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-[1400px] items-end px-4 pb-16 md:px-6 md:pb-24 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Rating + Year */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span className="text-lg font-bold text-accent">{rating}</span>
            </div>
            {year && (
              <span className="text-sm text-text-secondary">{year}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl leading-tight text-text md:text-5xl lg:text-6xl">
            {movie.title}
          </h1>

          {/* Overview */}
          {overview && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text/80 md:text-lg">
              {overview}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
            >
              <Info className="h-4 w-4" />
              View Details
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text transition-all hover:bg-surface active:scale-[0.97]"
            >
              <BookmarkPlus className="h-4 w-4" />
              Add to Watchlist
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
