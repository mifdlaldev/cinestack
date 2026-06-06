"use client";

import { useState, useCallback } from "react";
import { Filter, RotateCcw } from "lucide-react";

export interface FilterValues {
  genreId: number | null;
  year: number | null;
  sortBy: string;
}

interface FilterPanelProps {
  onApply: (filters: FilterValues) => void;
  genres: { id: number; name: string }[];
  initialValues?: Partial<FilterValues>;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity (High to Low)" },
  { value: "popularity.asc", label: "Popularity (Low to High)" },
  { value: "vote_average.desc", label: "Rating (High to Low)" },
  { value: "vote_average.asc", label: "Rating (Low to High)" },
  { value: "primary_release_date.desc", label: "Release Date (Newest)" },
  { value: "primary_release_date.asc", label: "Release Date (Oldest)" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1989 }, (_, i) =>
  String(currentYear - i),
);

export function FilterPanel({
  onApply,
  genres,
  initialValues,
  isLoading = false,
}: FilterPanelProps) {
  const [genreId, setGenreId] = useState<number | null>(
    initialValues?.genreId ?? null,
  );
  const [year, setYear] = useState<number | null>(
    initialValues?.year ?? null,
  );
  const [sortBy, setSortBy] = useState<string>(
    initialValues?.sortBy ?? "popularity.desc",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleApply = useCallback(() => {
    onApply({ genreId, year, sortBy });
  }, [genreId, year, sortBy, onApply]);

  const handleReset = useCallback(() => {
    setGenreId(null);
    setYear(null);
    setSortBy("popularity.desc");
    onApply({ genreId: null, year: null, sortBy: "popularity.desc" });
  }, [onApply]);

  const hasActiveFilters = genreId !== null || year !== null;

  const filterContent = (
    <>
      {/* Genre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Genre
        </label>
        <select
          value={genreId ?? ""}
          onChange={(e) =>
            setGenreId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Year
        </label>
        <select
          value={year ?? ""}
          onChange={(e) =>
            setYear(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
          ) : (
            "Apply"
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: horizontal bar */}
      <div className="hidden items-end gap-4 rounded-xl border border-border bg-bg-alt p-4 md:flex">
        {filterContent}
      </div>

      {/* Mobile: toggle button + collapsible panel */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-alt px-4 py-3 text-sm font-medium text-text transition-colors active:scale-[0.98]"
        >
          <Filter className="h-4 w-4" />
          {mobileOpen ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-3 space-y-4 rounded-xl border border-border bg-bg-alt p-4">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
}
