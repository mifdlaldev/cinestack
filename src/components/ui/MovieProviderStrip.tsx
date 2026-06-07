// ─────────────────────────────────────────────────────────────
// MovieProviderStrip — Horizontal row of provider badges for
// MovieCard. Fetches providers client-side and shows up to
// 5 logos with "+N more" overflow.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useId } from "react";
import type { TmdbWatchProvider, TmdbWatchProviders } from "@/types/tmdb";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/utils";

interface MovieProviderStripProps {
  movieId: number;
  className?: string;
}

const MAX_VISIBLE = 5;

type Status = "loading" | "success" | "error";

export function MovieProviderStrip({
  movieId,
  className,
}: MovieProviderStripProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [flatrate, setFlatrate] = useState<TmdbWatchProvider[]>([]);
  const uid = useId();

  useEffect(() => {
    let cancelled = false;

    async function fetchProviders() {
      try {
        const res = await fetch(`/api/movies/providers/${movieId}`);
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const json = await res.json();
        const providersData = json.data as TmdbWatchProviders;

        // Prefer US, fall back to first available country
        const countryCodes = Object.keys(providersData.results);
        const countryKey = countryCodes.includes("US")
          ? "US"
          : countryCodes[0] ?? null;

        if (!countryKey) {
          setStatus("error");
          return;
        }

        const country = providersData.results[countryKey];
        const allProviders: TmdbWatchProvider[] = [
          ...(country.flatrate ?? []),
          // Deduplicate: some providers appear in multiple categories
        ].filter(
          (p, i, arr) =>
            arr.findIndex((a) => a.provider_id === p.provider_id) === i,
        );

        // Sort by display_priority
        allProviders.sort((a, b) => a.display_priority - b.display_priority);

        if (!cancelled) {
          setFlatrate(allProviders);
          setStatus(allProviders.length > 0 ? "success" : "error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    fetchProviders();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  // Loading: skeleton shimmer
  if (status === "loading") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`${uid}-skeleton-${i}`}
            className="h-6 w-6 animate-pulse rounded-lg bg-surface"
          />
        ))}
      </div>
    );
  }

  // Error / no providers: render nothing (silent fail)
  if (status === "error" || flatrate.length === 0) {
    return null;
  }

  const visible = flatrate.slice(0, MAX_VISIBLE);
  const overflow = flatrate.length - MAX_VISIBLE;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visible.map((provider) => (
        <ProviderBadge
          key={provider.provider_id}
          provider={provider}
          size="sm"
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface text-[10px] font-medium text-text-secondary">
          +{overflow}
        </span>
      )}
    </div>
  );
}
