// ─────────────────────────────────────────────────────────────
// WatchProvidersEnhanced — Enhanced watch providers section
// with country selector, clickable provider links, and
// grouped Stream / Rent / Buy sections.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import type { TmdbWatchProviders, TmdbWatchProvider } from "@/types/tmdb";
import { getLogoUrl } from "@/lib/tmdb";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchProvidersEnhancedProps {
  providers: TmdbWatchProviders;
}

type ProviderCategory = "flatrate" | "rent" | "buy";

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  flatrate: "Stream",
  rent: "Rent",
  buy: "Buy",
};

const CATEGORY_ORDER: ProviderCategory[] = ["flatrate", "rent", "buy"];

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  IT: "Italy",
  ES: "Spain",
  KR: "South Korea",
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

export function WatchProvidersEnhanced({
  providers,
}: WatchProvidersEnhancedProps) {
  const countryCodes = useMemo(
    () => Object.keys(providers.results),
    [providers],
  );

  const [selectedCountry, setSelectedCountry] = useState<string>(() =>
    countryCodes.includes("US") ? "US" : countryCodes[0] ?? "US",
  );

  const countryData = providers.results[selectedCountry] ?? null;

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCountry(e.target.value);
    },
    [],
  );

  // No providers at all for any country
  if (countryCodes.length === 0) {
    return (
      <section>
        <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
          Where to Watch
        </h2>
        <p className="text-sm text-text-secondary">
          No streaming information available for this title.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-tight text-text">
          Where to Watch
        </h2>

        {/* Country selector */}
        {countryCodes.length > 1 && (
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none transition-colors focus:border-accent/50"
          >
            {countryCodes.map((code) => (
              <option key={code} value={code}>
                {getCountryName(code)}
              </option>
            ))}
          </select>
        )}
      </div>

      {countryData ? (
        <div className="flex flex-col gap-5">
          {CATEGORY_ORDER.map((category) => {
            const items = countryData[category] as
              | TmdbWatchProvider[]
              | undefined;
            if (!items || items.length === 0) return null;

            // Deduplicate by provider_id
            const unique = items.filter(
              (p, i, arr) =>
                arr.findIndex((a) => a.provider_id === p.provider_id) === i,
            );

            return (
              <ProviderGroup
                key={category}
                label={CATEGORY_LABELS[category]}
                providers={unique}
                link={countryData.link}
              />
            );
          })}

          {/* Empty state: no stream, rent, or buy */}
          {!countryData.flatrate &&
            !countryData.rent &&
            !countryData.buy && (
              <p className="text-sm text-text-secondary">
                Not available on any streaming service in{" "}
                {getCountryName(selectedCountry)}? Check back later.
              </p>
            )}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          No streaming information available for{" "}
          {getCountryName(selectedCountry)}.
        </p>
      )}
    </section>
  );
}

// ─── Provider Group ───────────────────────────────────────────

function ProviderGroup({
  label,
  providers,
  link,
}: {
  label: string;
  providers: TmdbWatchProvider[];
  link: string;
}) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </h4>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => {
          const logoSrc = getLogoUrl(provider.logo_path, "w92");

          return (
            <a
              key={provider.provider_id}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              title={`${provider.provider_name} — ${label}`}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface/60",
                "px-3 py-2.5 transition-all duration-200",
                "hover:border-accent/30 hover:bg-surface hover:shadow-[0_0_15px_rgba(245,197,24,0.06)]",
                "active:scale-[0.97]",
              )}
            >
              {/* Provider logo */}
              <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-hover">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={provider.provider_name}
                    width={32}
                    height={32}
                    className="object-contain p-0.5"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-text-secondary">
                    {provider.provider_name.slice(0, 2)}
                  </span>
                )}
              </div>

              {/* Provider name */}
              <span className="text-sm font-medium text-text transition-colors group-hover:text-accent">
                {provider.provider_name}
              </span>

              {/* External link icon */}
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary/50 transition-colors group-hover:text-accent/70" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
