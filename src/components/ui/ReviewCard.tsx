// ─────────────────────────────────────────────────────────────
// ReviewCard — Displays a single review
// ─────────────────────────────────────────────────────────────

"use client";

import { Pencil, Trash2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string | null): string {
  if (!name) return "bg-surface-hover";
  const colors = [
    "bg-accent/20",
    "bg-blue-500/20",
    "bg-emerald-500/20",
    "bg-purple-500/20",
    "bg-rose-500/20",
    "bg-amber-500/20",
    "bg-cyan-500/20",
    "bg-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getAvatarTextColor(name: string | null): string {
  if (!name) return "text-text-secondary";
  const colors = [
    "text-accent",
    "text-blue-400",
    "text-emerald-400",
    "text-purple-400",
    "text-rose-400",
    "text-amber-400",
    "text-cyan-400",
    "text-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++) {
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ReviewCard({
  review,
  isOwn = false,
  onEdit,
  onDelete,
  className,
}: ReviewCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border/80",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
              getAvatarColor(review.user?.name ?? null),
              getAvatarTextColor(review.user?.name ?? null),
            )}
            aria-hidden="true"
          >
            {getInitials(review.user?.name ?? null)}
          </div>

          <div>
            <p className="text-sm font-semibold text-text">
              {review.user?.name ?? "Anonymous"}
            </p>
            <p className="text-xs text-text-secondary">
              {formatRelativeTime(review.created_at)}
              {review.created_at !== review.updated_at && " (edited)"}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isOwn && (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-accent"
              aria-label="Edit review"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-error"
              aria-label="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-2">
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-text/90 whitespace-pre-wrap">
        {review.content}
      </p>
    </div>
  );
}
