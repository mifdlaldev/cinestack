// ─────────────────────────────────────────────────────────────
// Genre Page Loading State
// ─────────────────────────────────────────────────────────────

import { MovieCardSkeleton } from "@/components/ui/MovieCardSkeleton";

export default function GenrePageLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-surface" />

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 animate-pulse rounded bg-surface" />
        <div className="mt-2 h-5 w-36 animate-pulse rounded bg-surface" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
