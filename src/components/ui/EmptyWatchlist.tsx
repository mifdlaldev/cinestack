// ─────────────────────────────────────────────────────────────
// EmptyWatchlist — Empty state for the watchlist page
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
        <Clapperboard className="h-10 w-10 text-text-secondary" />
      </div>

      <h1 className="mb-3 font-display text-2xl tracking-tight text-text md:text-3xl">
        Your watchlist is empty
      </h1>

      <p className="mb-8 max-w-md text-text-secondary">
        Start exploring movies and add them to your watchlist to keep track of
        everything you want to watch.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
      >
        Browse Movies
      </Link>
    </div>
  );
}
