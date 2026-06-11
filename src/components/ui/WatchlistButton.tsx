// ─────────────────────────────────────────────────────────────
// WatchlistButton — Toggle watchlist (heart icon)
// ─────────────────────────────────────────────────────────────

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { createClient } from "@/lib/supabase-client";

interface WatchlistButtonProps {
  movieId: number;
  className?: string;
}

export function WatchlistButton({ movieId, className }: WatchlistButtonProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const storeIsInWatchlist = useWatchlistStore((s) => s.isInWatchlist(movieId));
  const storeIsLoading = useWatchlistStore((s) => s.isLoading);
  const toggleItem = useWatchlistStore((s) => s.toggleItem);
  const fetchWatchlist = useWatchlistStore((s) => s.fetchWatchlist);
  // Only show "in watchlist" when authenticated AND store has synced with server
  // This prevents stale localStorage data from a previous session
  const isInWatchlist = storeIsInWatchlist && isAuthenticated === true && !storeIsLoading;

  // Check auth status on mount and load watchlist if logged in
  // Guard with ref to prevent re-running when Zustand store hydrates
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const loggedIn = !!session;
      setIsAuthenticated(loggedIn);

      if (loggedIn) {
        // Silently sync watchlist from server on first load
        await fetchWatchlist();
      }
    }
    checkAuth();
  }, []); // Empty deps — only run once on mount

  const handleToggle = useCallback(async () => {
    if (isAuthenticated === false) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (isAuthenticated !== true) return; // Still checking auth

    setIsSyncing(true);
    toggleItem(movieId);
    // Give the store time to sync (optimistic + server sync)
    // The syncing visual state resolves after a small delay
    setTimeout(() => setIsSyncing(false), 600);
  }, [isAuthenticated, movieId, router, toggleItem]);

  // Still determining auth state — render nothing yet
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isSyncing}
      aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface/80 backdrop-blur-sm transition-all",
        "hover:border-accent/50 hover:bg-surface active:scale-[0.92]",
        isInWatchlist && "border-accent/40 bg-accent/10",
        isSyncing && "pointer-events-none opacity-60",
        className,
      )}
    >
      {isSyncing ? (
        <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
      ) : (
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            isInWatchlist
              ? "fill-accent text-accent"
              : "text-text-secondary hover:text-accent",
          )}
        />
      )}
    </button>
  );
}
