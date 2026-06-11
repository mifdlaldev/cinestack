"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProfileUrl } from "@/lib/tmdb";
import type { TmdbPaginatedResponse, TmdbPerson } from "@/types/tmdb";

async function fetchActors(query: string): Promise<TmdbPaginatedResponse<TmdbPerson>> {
  const res = await fetch(`/api/actors/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search actors");
  const json = await res.json();
  return json.data;
}

interface ActorSearchBarProps {
  children: ReactNode;
}

export function ActorSearchBar({ children }: ActorSearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const isSearching = debouncedQuery.length > 0;

  const { data: searchData, isLoading } = useQuery({
    queryKey: ["actor-search", debouncedQuery],
    queryFn: () => fetchActors(debouncedQuery),
    enabled: isSearching,
    staleTime: 60_000,
  });

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  const results = (searchData?.results ?? []).filter(
    (p) => p.known_for_department === "Acting",
  );

  return (
    <div>
      <div className="relative mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actors by name..."
          className="w-full rounded-full border border-border bg-surface py-3 pl-12 pr-12 text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isSearching && isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {isSearching && !isLoading && (
        <>
          {results.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-text-secondary">
                Found {searchData?.total_results ?? 0} result{(searchData?.total_results ?? 0) !== 1 ? "s" : ""} for &quot;{debouncedQuery}&quot;
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((actor) => (
                  <ActorSearchCard key={actor.id} actor={actor} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Search className="h-10 w-10 text-text-secondary/30" />
              <p className="text-lg text-text-secondary">No actors found for &quot;{debouncedQuery}&quot;</p>
            </div>
          )}
        </>
      )}

      {!isSearching && children}
    </div>
  );
}

function ActorSearchCard({ actor }: { actor: TmdbPerson }) {
  const profileUrl = getProfileUrl(actor.profile_path, "h632");
  const knownFor = actor.known_for
    ?.slice(0, 2)
    .map((m) => m.title)
    .join(", ");

  return (
    <Link
      href={`/actors/${actor.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-alt">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={actor.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-hover">
            <span className="font-display text-4xl text-text-secondary/20">?</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-text transition-colors group-hover:text-accent">
          {actor.name}
        </h3>
        <p className="text-xs text-text-secondary">
          {actor.known_for_department}
        </p>
        {knownFor && (
          <p className="line-clamp-1 text-xs text-text-secondary/70">
            {knownFor}
          </p>
        )}
      </div>
    </Link>
  );
}
