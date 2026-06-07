"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Search, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useServicesStore } from "@/stores/services-store";
import { getLogoUrl } from "@/lib/tmdb";
import type { TmdbWatchProvider } from "@/types/tmdb";

async function fetchProviders(): Promise<TmdbWatchProvider[]> {
  const res = await fetch("/api/movies/providers");
  if (!res.ok) throw new Error("Failed to fetch providers");
  const json = await res.json();
  return json.data;
}

export default function ServicesPage() {
  const { selectedProviders, toggleProvider, setProviders } =
    useServicesStore();
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    data: allProviders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["watch-providers"],
    queryFn: fetchProviders,
    staleTime: 86_400_000,
  });

  const handleClearAll = useCallback(() => {
    setProviders([]);
  }, [setProviders]);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const filtered = allProviders
    .filter(
      (p) =>
        p.provider_name.toLowerCase().includes(search.toLowerCase()) ||
        search === "",
    )
    .sort((a, b) => a.display_priority - b.display_priority);

  const selectedCount = selectedProviders.length;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 md:px-6 md:py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text md:text-4xl">
          My Streaming Services
        </h1>
        <p className="mt-2 text-text-secondary">
          Select the streaming services you subscribe to. Movies available on
          your services will be highlighted across the site.
        </p>
      </div>

      {/* Search + Actions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            disabled={selectedCount === 0}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear all
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
          >
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Provider grid */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-error/30 bg-error/5 px-6 py-12 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-error" />
          <p className="text-lg font-medium text-error">
            Failed to load providers
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Check your connection and try again
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <Search className="mb-3 h-10 w-10 text-text-secondary/30" />
          <p className="text-lg font-medium text-text">
            No providers found
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            No providers match &quot;{search}&quot;
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((provider) => {
            const selected = selectedProviders.includes(provider.provider_id);
            return (
              <button
                key={provider.provider_id}
                onClick={() => toggleProvider(provider.provider_id)}
                className={`group flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all active:scale-[0.97] ${
                  selected
                    ? "border-accent/60 bg-accent/10"
                    : "border-border bg-surface hover:border-accent/30 hover:bg-accent/5"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                    selected
                      ? "border-accent bg-accent"
                      : "border-border group-hover:border-accent/40"
                  }`}
                >
                  {selected && <Check className="h-4 w-4 text-bg" />}
                </div>

                {/* Logo */}
                {provider.logo_path ? (
                  <Image
                    src={getLogoUrl(provider.logo_path, "w92") ?? ""}
                    alt={provider.provider_name}
                    width={32}
                    height={32}
                    className="object-contain brightness-0 invert"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-sm font-bold uppercase text-text-secondary">
                    {provider.provider_name.charAt(0)}
                  </div>
                )}

                {/* Name */}
                <span className="text-sm text-text">
                  {provider.provider_name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {selectedCount > 0 && (
        <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
          <p className="text-sm text-text">
            <span className="font-semibold text-accent">{selectedCount}</span>{" "}
            service{selectedCount > 1 ? "s" : ""} selected. Movies from these
            services will appear in the &quot;Available on Your Services&quot;
            row on the homepage and can be used as a filter on the Discover page.
          </p>
        </div>
      )}
    </div>
  );
}
