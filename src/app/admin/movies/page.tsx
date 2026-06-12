// ─────────────────────────────────────────────────────────────
// Admin Movies Management — Search TMDB + view cached movies
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Film,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  X,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getImageUrl } from "@/lib/tmdb";

interface CachedMovie {
  id: number;
  tmdb_id: number;
  title: string;
  data: {
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    overview: string;
  };
  cached_at: string;
}

interface CachedMoviesResponse {
  data: CachedMovie[];
  count: number;
  totalPages: number;
  page: number;
}

interface TmdbSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export default function AdminMoviesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch cached movies
  const cachedQuery = useQuery<CachedMoviesResponse>({
    queryKey: ["admin-movies-cached", page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      const res = await fetch(`/api/admin/movies?${params}`);
      if (!res.ok) throw new Error("Failed to fetch cached movies");
      return res.json();
    },
  });

  // Fetch all cached TMDB IDs to show sync status across refreshes
  const cachedIdsQuery = useQuery<number[]>({
    queryKey: ["admin-movies-cached-ids"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/movies?all_ids=true`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.ids ?? [];
    },
    staleTime: 30_000,
  });

  // TMDB search
  const [tmdbPage, setTmdbPage] = useState(1);
  const tmdbSearchQuery = useQuery<TmdbSearchResult[]>({
    queryKey: ["admin-movies-tmdb-search", searchQuery, tmdbPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchQuery,
        page: String(tmdbPage),
      });
      const res = await fetch(`/api/admin/movies/search?${params}`);
      if (!res.ok) throw new Error("Failed to search TMDB");
      return res.json();
    },
    enabled: searchQuery.length > 0,
  });

  // Sync movie to cache
  const [syncedIds, setSyncedIds] = useState<Record<number, boolean>>({});
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const syncMutation = useMutation({
    mutationFn: async (tmdbId: number) => {
      setSyncingId(tmdbId);
      const res = await fetch("/api/admin/movies/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to sync movie");
      }
      return tmdbId;
    },
    onSuccess: (tmdbId) => {
      setSyncedIds((prev) => ({ ...prev, [tmdbId]: true }));
      setSyncingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-movies-cached"] });
      queryClient.invalidateQueries({ queryKey: ["admin-movies-cached-ids"] });
    },
    onError: () => {
      setSyncingId(null);
    },
  });

  const deleteFromCache = useMutation({
    mutationFn: async (tmdbId: number) => {
      setDeletingId(tmdbId);
      const res = await fetch("/api/admin/movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to remove from cache");
      }
    },
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-movies-cached"] });
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      setTmdbPage(1);
      setShowSearch(true);
    }, 400);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchQuery("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            Movies
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage cached movies and sync from TMDB
          </p>
        </div>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (!showSearch) {
              setSearchQuery("");
              if (debounceRef.current) clearTimeout(debounceRef.current);
            }
          }}
          className={cn(
            "self-end sm:self-auto inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.97]",
            showSearch
              ? "border border-border bg-surface text-text hover:bg-surface-hover"
              : "bg-accent text-bg hover:bg-accent-hover",
          )}
        >
          <Search className="h-4 w-4" />
          {showSearch ? "View Cached" : "Search TMDB"}
        </button>
      </div>

      {/* Loading */}
      {cachedQuery.isLoading && !showSearch && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-4 overflow-hidden">
              <div className="h-24 w-16 flex-shrink-0 animate-pulse rounded-lg bg-surface-hover" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-surface-hover" />
                <div className="h-6 w-24 animate-pulse rounded-lg bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TMDB Search loading */}
      {tmdbSearchQuery.isLoading && showSearch && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-4 overflow-hidden">
              <div className="h-24 w-16 flex-shrink-0 animate-pulse rounded-lg bg-surface-hover" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-surface-hover" />
                <div className="h-6 w-24 animate-pulse rounded-lg bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TMDB Search Panel */}
      {showSearch && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              ref={inputRef}
              type="text"
              defaultValue=""
              onChange={handleSearchChange}
              placeholder="Search TMDB movies..."
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-secondary transition-colors hover:text-text"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* TMDB Search Results */}
          {tmdbSearchQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          )}

          {tmdbSearchQuery.isError && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4">
              <p className="text-sm text-error">
                {tmdbSearchQuery.error instanceof Error
                  ? tmdbSearchQuery.error.message
                  : "Failed to search TMDB"}
              </p>
            </div>
          )}

          {tmdbSearchQuery.data && tmdbSearchQuery.data.length === 0 && (
            <div className="rounded-xl border border-border bg-surface px-5 py-12 text-center">
              <Film className="mx-auto mb-3 h-8 w-8 text-text-secondary" />
              <p className="text-sm text-text-secondary">
                No movies found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}

          {tmdbSearchQuery.data && tmdbSearchQuery.data.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tmdbSearchQuery.data.map((movie) => {
                const posterUrl = getImageUrl(movie.poster_path, "w185");
                const isSyncing = syncingId === movie.id;
                const isSynced = syncedIds[movie.id] || cachedIdsQuery.data?.includes(movie.id);
                return (
                  <div
                    key={movie.id}
                    className="flex gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-[0_0_15px_rgba(245,197,24,0.06)] overflow-hidden"
                  >
                    <Link
                      href={`/movies/${movie.id}`}
                      className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-hover"
                    >
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Film className="h-5 w-5 text-text-secondary" />
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/movies/${movie.id}`}
                        className="line-clamp-2 text-sm font-semibold text-text transition-colors hover:text-accent"
                      >
                        {movie.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-text-secondary">
                      {movie.release_date?.slice(0, 4) ?? "N/A"} &middot;{" "}
                      {movie.vote_average ? (movie.vote_average).toFixed(1) : "?"}/10
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                        {movie.overview || "No overview available"}
                      </p>
                      {isSynced ? (
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          In Cache
                        </span>
                      ) : (
                        <button
                          onClick={() => syncMutation.mutate(movie.id)}
                          disabled={isSyncing}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent/20 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSyncing ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              Sync to Cache
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cached Movies */}
      {!showSearch && !cachedQuery.isLoading && !cachedQuery.isError && (
        <>
          {cachedQuery.data && cachedQuery.data.data.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-16 text-center">
              <Film className="mx-auto mb-3 h-10 w-10 text-text-secondary" />
              <p className="text-lg font-medium text-text">No cached movies</p>
              <p className="mt-1 text-sm text-text-secondary">
                Search TMDB above to start caching movies
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(cachedQuery.data?.data ?? []).map((movie) => (
                <div
                  key={movie.id}
                  className="flex gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border/80 overflow-hidden"
                >
                  <Link
                    href={`/movies/${movie.tmdb_id}`}
                    className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-hover"
                  >
                    {movie.data.poster_path ? (
                      <Image
                        src={getImageUrl(movie.data.poster_path, "w185") ?? ""}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-5 w-5 text-text-secondary" />
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/movies/${movie.tmdb_id}`}
                        className="line-clamp-2 text-sm font-semibold text-text transition-colors hover:text-accent"
                      >
                        {movie.title}
                      </Link>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    </div>
                    <p className="text-xs text-text-secondary">
                      {movie.data.release_date?.slice(0, 4) ?? "N/A"} &middot;{" "}
                      {movie.data.vote_average ? movie.data.vote_average.toFixed(1) : "?"}/10
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                      {movie.data.overview || "No overview"}
                    </p>
                    <p className="mt-1 text-[10px] text-text-secondary">
                      Cached {formatRelativeTime(movie.cached_at)}
                    </p>
                    <button
                      onClick={() => deleteFromCache.mutate(movie.tmdb_id)}
                      disabled={deletingId === movie.tmdb_id}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-error/20 px-2.5 py-1 text-[11px] font-medium text-error/70 transition-all hover:bg-error/5 hover:text-error active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deletingId === movie.tmdb_id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {cachedQuery.data && cachedQuery.data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {cachedQuery.data.page} of {cachedQuery.data.totalPages} (
                {cachedQuery.data.count} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (cachedQuery.data?.totalPages ?? 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Cached error */}
      {cachedQuery.isError && !showSearch && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4">
          <p className="text-sm text-error">
            {cachedQuery.error instanceof Error
              ? cachedQuery.error.message
              : "Failed to load cached movies"}
          </p>
        </div>
      )}
    </div>
  );
}
