"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Search, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useServicesStore } from "@/stores/services-store";
import { getLogoUrl } from "@/lib/tmdb";
import type { TmdbWatchProvider } from "@/types/tmdb";

interface MyServicesModalProps {
  open: boolean;
  onClose: () => void;
}

async function fetchProviders(): Promise<TmdbWatchProvider[]> {
  const res = await fetch("/api/movies/providers");
  if (!res.ok) throw new Error("Failed to fetch providers");
  const json = await res.json();
  return json.data;
}

export function MyServicesModal({ open, onClose }: MyServicesModalProps) {
  const { selectedProviders, toggleProvider, setProviders } =
    useServicesStore();
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    data: allProviders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["watch-providers"],
    queryFn: fetchProviders,
    staleTime: 86_400_000,
  });

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap: focus modal on open
  useEffect(() => {
    if (open) {
      modalRef.current?.focus();
    }
  }, [open]);

  const filtered = allProviders
    .filter(
      (p) =>
        p.provider_name.toLowerCase().includes(search.toLowerCase()) ||
        search === "",
    )
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, 60);

  const handleClearAll = useCallback(() => {
    setProviders([]);
  }, [setProviders]);

  const handleSave = useCallback(() => {
    onClose();
  }, [onClose]);

  const selectedCount = selectedProviders.length;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Select your streaming services"
            tabIndex={-1}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl glass-strong shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-lg text-text">
                  My Streaming Services
                </h2>
                <p className="mt-0.5 text-sm text-text-secondary">
                  Select the services you subscribe to
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-border px-6 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search providers..."
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-text placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Provider grid */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="mb-2 h-8 w-8 text-error" />
                  <p className="text-sm text-text-secondary">
                    Failed to load providers
                  </p>
                  <p className="mt-4 text-xs text-text-secondary">
                    Check your connection and try again
                  </p>
                </div>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="mb-2 h-8 w-8 text-text-secondary/40" />
                  <p className="text-sm text-text-secondary">
                    No providers match &quot;{search}&quot;
                  </p>
                </div>
              )}

              {!isLoading && !isError && filtered.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {filtered.map((provider) => {
                    const selected = selectedProviders.includes(
                      provider.provider_id,
                    );
                    return (
                      <button
                        key={provider.provider_id}
                        onClick={() => toggleProvider(provider.provider_id)}
                        className={`group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                          selected
                            ? "border-accent/60 bg-accent/10"
                            : "border-border bg-surface hover:border-accent/30 hover:bg-accent/5"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
                            selected
                              ? "border-accent bg-accent"
                              : "border-border group-hover:border-accent/40"
                          }`}
                        >
                          {selected && (
                            <Check className="h-3.5 w-3.5 text-bg" />
                          )}
                        </div>

                        {/* Logo */}
                        {provider.logo_path ? (
                          <Image
                            src={getLogoUrl(provider.logo_path, "w92") ?? ""}
                            alt={provider.provider_name}
                            width={24}
                            height={24}
                            className="flex-shrink-0 rounded object-contain brightness-0 invert"
                          />
                        ) : (
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-surface text-[10px] font-bold uppercase text-text-secondary">
                            {provider.provider_name.charAt(0)}
                          </div>
                        )}

                        {/* Name */}
                        <span className="truncate text-sm text-text">
                          {provider.provider_name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <button
                onClick={handleClearAll}
                disabled={selectedCount === 0}
                className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear all
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary">
                  {selectedCount} selected
                </span>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
