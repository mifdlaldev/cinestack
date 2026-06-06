"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TmdbMovie } from "@/types/tmdb";
import { MovieCard } from "./MovieCard";
import { AnimatedSection } from "./AnimatedSection";

interface MovieRowProps {
  title: string;
  movies: TmdbMovie[];
  href?: string;
}

export function MovieRow({ title, movies, href }: MovieRowProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatedSection>
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
                <MovieCard movie={movie} priority={i < 5} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatedSection>
  );
}
