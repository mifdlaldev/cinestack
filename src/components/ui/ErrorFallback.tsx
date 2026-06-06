// ─────────────────────────────────────────────────────────────
// ErrorFallback — Small inline error for specific sections
// Use in movie rows, search results, or any section that can
// fail independently without crashing the whole page.
// ─────────────────────────────────────────────────────────────

"use client";

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorFallbackProps {
  /** Human-friendly error description */
  message?: string;
  /** If provided, shows a "Retry" button */
  onRetry?: () => void;
  /** Optional children for custom fallback content */
  children?: ReactNode;
}

export function ErrorFallback({
  message = "Something went wrong loading this section.",
  onRetry,
  children,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-error/20 bg-error/5 px-4 py-8 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-error/80" />

      {children ?? (
        <p className="max-w-sm text-sm text-text-secondary">{message}</p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface px-3 py-1.5 text-xs font-medium text-text transition-all hover:bg-surface-hover active:scale-[0.97]"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
