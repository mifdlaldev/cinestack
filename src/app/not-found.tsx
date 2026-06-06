// ─────────────────────────────────────────────────────────────
// not-found — Custom 404 page with cinematic CineStack design
// Server Component — no client state, no animation libraries
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { Home, Clapperboard } from "lucide-react";

export default function NotFound() {
  return (
    <>
      {/* Film grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-6 text-center">
        {/* Large 404 */}
        <h1 className="font-display text-[clamp(6rem,20vw,12rem)] leading-none tracking-tighter text-accent">
          404
        </h1>

        {/* Subtitle */}
        <p className="mt-4 font-display text-lg tracking-tight text-text md:text-xl">
          This scene doesn&apos;t exist in our collection
        </p>

        {/* Description */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
          The page you&apos;re looking for might have been removed, had its
          name changed, or is temporarily unavailable. Let&apos;s get you back
          to the cinema.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-all hover:bg-surface-hover active:scale-[0.97]"
          >
            <Clapperboard className="h-4 w-4" />
            Browse Movies
          </Link>
        </div>
      </div>
    </>
  );
}
