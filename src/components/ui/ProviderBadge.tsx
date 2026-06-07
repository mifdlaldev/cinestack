// ─────────────────────────────────────────────────────────────
// ProviderBadge — Small rounded logo badge for a streaming
// service provider (Netflix, Disney+, HBO, Prime, etc.)
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import type { TmdbWatchProvider } from "@/types/tmdb";
import { getLogoUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface ProviderBadgeProps {
  provider: TmdbWatchProvider;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { dim: 24, container: "h-6 w-6" },
  md: { dim: 32, container: "h-8 w-8" },
  lg: { dim: 40, container: "h-10 w-10" },
} as const;

export function ProviderBadge({
  provider,
  size = "md",
  className,
}: ProviderBadgeProps) {
  const { dim, container } = sizeMap[size];
  const logoSrc = getLogoUrl(provider.logo_path, size === "sm" ? "w45" : "w92");

  return (
    <div
      title={provider.provider_name}
      className={cn(
        "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-surface/80",
        container,
        className,
      )}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={provider.provider_name}
          width={dim}
          height={dim}
          className="object-contain p-0.5"
        />
      ) : (
        <span className="px-1 text-[8px] font-semibold leading-tight text-text-secondary">
          {provider.provider_name.slice(0, 2)}
        </span>
      )}
    </div>
  );
}
