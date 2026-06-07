// ─────────────────────────────────────────────────────────────
// MovieProviderStrip — Horizontal row of provider badges for
// MovieCard. Receives pre-fetched `flatrate` data as a prop
// (no client-side fetching).
// ─────────────────────────────────────────────────────────────

import type { TmdbWatchProvider } from "@/types/tmdb";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/utils";

interface MovieProviderStripProps {
  flatrate: TmdbWatchProvider[];
  className?: string;
}

const MAX_VISIBLE = 5;

export function MovieProviderStrip({
  flatrate,
  className,
}: MovieProviderStripProps) {
  if (flatrate.length === 0) return null;

  const visible = flatrate.slice(0, MAX_VISIBLE);
  const overflow = flatrate.length - MAX_VISIBLE;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visible.map((provider) => (
        <ProviderBadge
          key={provider.provider_id}
          provider={provider}
          size="sm"
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface text-[10px] font-medium text-text-secondary">
          +{overflow}
        </span>
      )}
    </div>
  );
}
