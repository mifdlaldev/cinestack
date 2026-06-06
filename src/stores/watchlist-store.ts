// ─────────────────────────────────────────────────────────────
// Watchlist Store — Zustand with localStorage persistence
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  /** Array of TMDB movie IDs in the user's watchlist. */
  items: number[];
  /** True while fetching from server. */
  isLoading: boolean;
  /** Last sync error message, if any. */
  error: string | null;

  // ─── Actions ────────────────────────────────────────────────

  /** Replace the entire watchlist (e.g. after fetching from server). */
  setItems: (items: number[]) => void;
  /** Add a movie optimistically and sync to server. */
  addItem: (movieId: number) => void;
  /** Remove a movie optimistically and sync to server. */
  removeItem: (movieId: number) => void;
  /** Toggle a movie — add if absent, remove if present. */
  toggleItem: (movieId: number) => void;
  /** Check if a movie is in the watchlist. */
  isInWatchlist: (movieId: number) => boolean;
  /** Fetch watchlist from the server API and merge. */
  fetchWatchlist: () => Promise<void>;
  /** Sync a single add/remove to the server. */
  syncToServer: (movieId: number, action: "add" | "remove") => Promise<void>;
  /** Clear any pending error. */
  clearError: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      setItems: (items) => set({ items }),

      addItem: (movieId) => {
        const { items, isInWatchlist } = get();
        if (isInWatchlist(movieId)) return;

        // Optimistic update
        set({ items: [...items, movieId] });

        // Sync to server (fire-and-forget)
        get().syncToServer(movieId, "add");
      },

      removeItem: (movieId) => {
        const { items } = get();
        if (!items.includes(movieId)) return;

        // Optimistic update
        set({ items: items.filter((id) => id !== movieId) });

        // Sync to server (fire-and-forget)
        get().syncToServer(movieId, "remove");
      },

      toggleItem: (movieId) => {
        const { isInWatchlist } = get();
        if (isInWatchlist(movieId)) {
          get().removeItem(movieId);
        } else {
          get().addItem(movieId);
        }
      },

      isInWatchlist: (movieId) => get().items.includes(movieId),

      fetchWatchlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/watchlist");
          if (!res.ok) {
            if (res.status === 401) {
              // Not authenticated — keep localStorage state
              set({ isLoading: false });
              return;
            }
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error?.message ?? "Failed to fetch watchlist");
          }
          const body = await res.json();
          const serverItems: number[] = body.data ?? [];

          // Merge: prefer server state (source of truth)
          set({ items: serverItems, isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      },

      syncToServer: async (movieId, action) => {
        try {
          const url =
            action === "add"
              ? "/api/watchlist"
              : `/api/watchlist/${movieId}`;
          const options: RequestInit =
            action === "add"
              ? {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ movieId }),
                }
              : { method: "DELETE" };

          const res = await fetch(url, options);

          if (!res.ok && res.status !== 401) {
            const body = await res.json().catch(() => ({}));
            throw new Error(
              body.error?.message ?? `Failed to ${action} movie`,
            );
          }
        } catch (err) {
          // On failure, revert the optimistic update
          const { items } = get();
          if (action === "add") {
            set({ items: items.filter((id) => id !== movieId) });
          } else {
            set({ items: [...items, movieId] });
          }
          set({
            error: err instanceof Error ? err.message : "Sync failed",
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "cinestack-watchlist",
      // Only persist items — derived state and actions don't need serialization
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
