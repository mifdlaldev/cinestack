// ─────────────────────────────────────────────────────────────
// Watchlist Page — Protected, shows user's saved movies
// ─────────────────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import { getMovieDetail } from "@/lib/tmdb";
import { MovieGrid } from "@/components/ui/MovieGrid";
import { MovieCardSkeleton } from "@/components/ui/MovieCardSkeleton";
import { EmptyWatchlist } from "@/components/ui/EmptyWatchlist";

export const metadata: Metadata = {
  title: "Watchlist",
};

// ─── Revalidation ────────────────────────────────────────────

export const revalidate = 0; // Always fresh — watchlist is user-specific

// ─── Page ────────────────────────────────────────────────────

async function WatchlistContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Should never happen — middleware redirects unauthenticated users
  if (!user) {
    return <EmptyWatchlist />;
  }

  // Fetch watchlist movie IDs from database
  const { data: watchlist } = await supabase
    .from("watchlists")
    .select("movie_id")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (!watchlist || watchlist.length === 0) {
    return <EmptyWatchlist />;
  }

  const movieIds = watchlist.map((row) => row.movie_id);

  // Fetch full movie details from TMDB in parallel
  // Limit to 20 to avoid excessive API calls
  const batchSize = 20;
  const batch = movieIds.slice(0, batchSize);

  const movies = await Promise.all(
    batch.map(async (movieId) => {
      try {
        return await getMovieDetail(movieId);
      } catch {
        return null;
      }
    }),
  );

  const validMovies = movies.filter(
    (m) => m !== null && m !== undefined,
  );

  if (validMovies.length === 0) {
    return <EmptyWatchlist />;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl">
          Your Watchlist
        </h1>
        <p className="mt-2 text-text-secondary">
          {validMovies.length} {validMovies.length === 1 ? "movie" : "movies"} saved
        </p>
      </div>

      <MovieGrid movies={validMovies} />
    </div>
  );
}

function WatchlistSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-12 lg:px-8">
      <div className="mb-8">
        <div className="h-10 w-64 animate-pulse rounded bg-surface" />
        <div className="mt-2 h-5 w-32 animate-pulse rounded bg-surface" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense fallback={<WatchlistSkeleton />}>
      <WatchlistContent />
    </Suspense>
  );
}
