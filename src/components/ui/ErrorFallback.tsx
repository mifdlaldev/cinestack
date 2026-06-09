// ─────────────────────────────────────────────────────────────
// ErrorFallback — Small inline error for specific sections
// Use in movie rows, search results, or any section that can
// fail independently without crashing the whole page.
// ─────────────────────────────────────────────────────────────

"use client";

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card
      role="alert"
      className="border-error/20 bg-error/5"
    >
      <CardContent className="flex flex-col items-center gap-3 px-4 py-8 text-center">
        <AlertTriangle className="h-8 w-8 text-error/80" />

        {children ?? (
          <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        )}

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
