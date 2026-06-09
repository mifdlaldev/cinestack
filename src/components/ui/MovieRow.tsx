"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TmdbMovie, TmdbWatchProvider } from "@/types/tmdb";
import { MovieCard } from "./MovieCard";
import { AnimatedSection } from "./AnimatedSection";

interface MovieRowProps {
  title: string;
  movies: TmdbMovie[];
  href?: string;
  providersMap?: Record<number, TmdbWatchProvider[]>;
}

export function MovieRow({ title, movies, href, providersMap }: MovieRowProps) {
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkScroll]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 200 + 20;
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  }, []);

  return (
    <AnimatedSection>
      <section className="relative overflow-x-clip">
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
        <div className="relative">
          {/* Left gradient overlay */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute top-0 z-10 h-full w-24 bg-gradient-to-r from-bg to-transparent -left-4 md:-left-6 lg:-left-8" />
          )}

          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-2 top-[40%] z-20 -translate-y-1/2"
              aria-label="Scroll left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-[20px] text-text shadow-lg border border-white/[0.06]">
                <ChevronLeft className="h-5 w-5" />
              </div>
            </button>
          )}

          {/* Right gradient overlay */}
          {canScrollRight && (
            <div className="pointer-events-none absolute top-0 z-10 h-full w-24 bg-gradient-to-l from-bg to-transparent -right-4 md:-right-6 lg:-right-8" />
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollBy("right")}
              className="absolute right-2 top-[40%] z-20 -translate-y-1/2"
              aria-label="Scroll right"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-[20px] text-text shadow-lg border border-white/[0.06]">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="-mx-4 overflow-x-auto hide-scrollbar px-4 pb-4 pt-2 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
          >
            <motion.div
              className="flex gap-4 sm:gap-5"
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
                  className="w-[160px] flex-shrink-0 sm:w-[180px] md:w-[200px]"
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
                  <MovieCard movie={movie} priority={i < 5} providers={providersMap?.[movie.id]} />
                </motion.div>
              ))}
              {/* Spacer for end-of-scroll breathing room */}
              <div className="w-4 flex-shrink-0 md:w-6 lg:w-8" />
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
