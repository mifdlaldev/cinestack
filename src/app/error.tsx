// ─────────────────────────────────────────────────────────────
// error — Global error boundary for Server Components
// Must be a Client Component per Next.js requirements.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in development only — never expose to users
    if (process.env.NODE_ENV === "development") {
      console.error("Caught by error boundary:", error);
    }
  }, [error]);

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
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
          <AlertTriangle className="h-10 w-10 text-error" />
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
          We encountered an unexpected error. Please try again, or head back
          to the home page.
        </p>

        {/* Error digest for support (not stack trace) */}
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-text-secondary/50">
            Reference: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition-all hover:bg-surface-hover active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
