"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { TmdbMovie } from "@/types/tmdb";
import { getBackdropUrl } from "@/lib/tmdb";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickBatch(pool: TmdbMovie[], count: number): TmdbMovie[] {
  return shuffleArray(pool).slice(0, count);
}

interface HeroSectionProps {
  movies: TmdbMovie[];
}

export function HeroSection({ movies: pool }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [batch, setBatch] = useState<TmdbMovie[]>(() => pickBatch(pool, 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMovie = batch[currentIndex];
  const totalMovies = batch.length;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = (prev + 1) % totalMovies;
      // If we're wrapping back to the first slide, refresh the batch
      if (next === 0) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          setBatch(pickBatch(pool, 5));
        }, 0);
      }
      return next;
    });
  }, [totalMovies, pool]);

  // Auto-rotate every 10 seconds
  useEffect(() => {
    if (totalMovies <= 1) return;
    intervalRef.current = setInterval(goNext, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goNext, totalMovies]);

  const pauseAutoRotate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeAutoRotate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goNext, 10000);
  };

  if (!currentMovie) return null;

  const backdropUrl = getBackdropUrl(currentMovie.backdrop_path, "original");
  const year = currentMovie.release_date?.slice(0, 4);
  const rating = currentMovie.vote_average.toFixed(1);
  const raw = currentMovie.overview;
  const shortOverview = raw
    ? raw.split(/[.!?]/)[0].trim().replace(/[,;:\s]+$/, "") + "."
    : "";

  // ─── Animation variants ──────────────────────────────────

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? 30 : -30,
    }),
    animate: { opacity: 1, y: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? -30 : 30,
    }),
  };

  const transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  return (
    <section
      className="relative -mt-16 min-h-dvh overflow-hidden pt-16"
      onMouseEnter={totalMovies > 1 ? pauseAutoRotate : undefined}
      onMouseLeave={totalMovies > 1 ? resumeAutoRotate : undefined}
    >
      {/* ─── Backdrop crossfade ─────────────────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentMovie.id}
          variants={shouldReduceMotion ? undefined : backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
        >
          {backdropUrl ? (
            <Image
              src={backdropUrl}
              alt={currentMovie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface to-bg" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Gradient overlays ──────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-bg/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 via-[35%] to-transparent" />

      {/* ─── Content ────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1400px] items-center px-4 pb-20 pt-20 md:px-6 md:pb-24 lg:px-8">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentMovie.id}
            custom={direction}
            variants={shouldReduceMotion ? undefined : contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <div className="rounded-2xl p-6 md:p-8">
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
              <h1 className="font-display text-3xl leading-tight text-text md:text-4xl lg:text-5xl">
                {currentMovie.title}
              </h1>

              {/* Overview */}
              {shortOverview && (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-text/80 md:text-base">
                  {shortOverview}
                </p>
              )}

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="default"
                  size="lg"
                  nativeButton={false}
                  render={<Link href={`/movies/${currentMovie.id}`} />}
                >
                  <Info data-icon="inline-start" />
                  View Details
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Dot indicators ─────────────────────────────────── */}
      {totalMovies > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {batch.map((movie, index) => (
            <button
              key={movie.id}
              onClick={() => goTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-accent"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
