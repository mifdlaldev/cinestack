"use client";

import { useState, useCallback } from "react";
import { Filter, RotateCcw, Monitor } from "lucide-react";
import { useServicesStore } from "@/stores/services-store";
import { MyServicesModal } from "./MyServicesModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterValues {
  genreId: number | null;
  year: number | null;
  sortBy: string;
  providerIds: number[];
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
const YEAR_OPTIONS = Array.from({ length: currentYear - 1899 }, (_, i) =>
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
  const [servicesModalOpen, setServicesModalOpen] = useState(false);

  const { selectedProviders, setProviders } = useServicesStore();

  const handleApply = useCallback(() => {
    onApply({ genreId, year, sortBy, providerIds: selectedProviders });
  }, [genreId, year, sortBy, selectedProviders, onApply]);

  const handleReset = useCallback(() => {
    setGenreId(null);
    setYear(null);
    setSortBy("popularity.desc");
    setProviders([]);
    onApply({
      genreId: null,
      year: null,
      sortBy: "popularity.desc",
      providerIds: [],
    });
  }, [onApply, setProviders]);

  const hasActiveFilters =
    genreId !== null || year !== null || selectedProviders.length > 0;

  const providerCount = selectedProviders.length;

  const filterContent = (
    <>
      {/* Genre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Genre
        </label>
        <Select
          value={genreId !== null ? String(genreId) : ""}
          onValueChange={(val) =>
            setGenreId(val ? Number(val) : null)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Year
        </label>
        <Select
          value={year !== null ? String(year) : ""}
          onValueChange={(val) =>
            setYear(val ? Number(val) : null)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Streaming On */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Streaming On
        </label>
        <button
          type="button"
          onClick={() => setServicesModalOpen(true)}
          className="flex w-full items-center justify-start gap-1.5 rounded-full border border-border bg-transparent px-[15px] py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <Monitor className="h-4 w-4 flex-shrink-0 text-text-secondary" />
          <span className={`flex-1 text-left ${providerCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
            {providerCount > 0
              ? `${providerCount} service${providerCount > 1 ? "s" : ""} selected`
              : "Select services"}
          </span>
          {providerCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg">
              {providerCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Sort By
        </label>
        <Select value={sortBy} onValueChange={(val) => val !== null && setSortBy(val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="min-w-[260px]">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleApply}
          disabled={isLoading}
          className="flex-1 justify-center"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
          ) : (
            "Apply"
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
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
        <Button
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {mobileOpen ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
              !
            </span>
          )}
        </Button>

        {mobileOpen && (
          <div className="mt-3 space-y-4 rounded-xl border border-border bg-bg-alt p-4">
            {filterContent}
          </div>
        )}
      </div>

      {/* Services Modal */}
      <MyServicesModal
        open={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
      />
    </>
  );
}
