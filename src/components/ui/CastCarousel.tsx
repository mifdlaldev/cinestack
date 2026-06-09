"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { TmdbCastMember } from "@/types/tmdb";
import { getProfileUrl } from "@/lib/tmdb";

const PLACEHOLDER_PROFILE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231a1a24' width='200' height='300'/%3E%3Ccircle fill='%2324242e' cx='100' cy='90' r='40'/%3E%3Cpath fill='%2324242e' d='M30 260 Q100 170 170 260'/%3E%3C/svg%3E";

function CastCard({ member }: { member: TmdbCastMember }) {
  const profileUrl = getProfileUrl(member.profile_path, "w185");

  return (
    <div className="flex w-32 flex-shrink-0 flex-col items-center text-center sm:w-36">
      <div className="mb-2 h-32 w-32 overflow-hidden rounded-full border-2 border-border sm:h-36 sm:w-36">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={member.name}
            width={144}
            height={144}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-surface-hover"
            style={{
              backgroundImage: `url("${PLACEHOLDER_PROFILE}")`,
              backgroundSize: "cover",
            }}
          />
        )}
      </div>
      <p className="line-clamp-1 text-sm font-semibold text-text">
        {member.name}
      </p>
      <p className="line-clamp-1 text-xs text-text-secondary">
        {member.character}
      </p>
    </div>
  );
}

interface CastCarouselProps {
  cast: TmdbCastMember[];
}

export function CastCarousel({ cast }: CastCarouselProps) {
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
    const scrollAmount = 160;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <section className="mb-14">
      <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
        Cast
      </h2>
      <div className="group relative">
        {/* Left gradient */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-bg to-transparent" />
        )}

        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy("left")}
            className="absolute left-0 top-[40%] z-20 -translate-y-1/2"
            aria-label="Scroll left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-[20px] text-text shadow-lg border border-white/[0.06]">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </button>
        )}

        {/* Right gradient */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-bg to-transparent" />
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy("right")}
            className="absolute right-0 top-[40%] z-20 -translate-y-1/2"
            aria-label="Scroll right"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-[20px] text-text shadow-lg border border-white/[0.06]">
              <ChevronRight className="h-5 w-5" />
            </div>
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
        >
          {cast.map((member) => (
            <CastCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
