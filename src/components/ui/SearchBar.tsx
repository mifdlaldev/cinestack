"use client";

import { useCallback, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onSearch,
  placeholder = "Search movies...",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, 400);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  return (
    <div className="relative w-full max-w-2xl">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search movies"
        className="w-full rounded-xl border border-border bg-surface py-3.5 pl-12 pr-12 text-base text-text placeholder-text-secondary/60 outline-none transition-all duration-200 focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      {value.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
