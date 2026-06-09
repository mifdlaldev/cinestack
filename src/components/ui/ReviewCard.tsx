"use client";

import { useState, useCallback } from "react";
import { Pencil, Trash2, MessageCircle, Flag } from "lucide-react";
import { StarRating } from "./StarRating";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isAuthenticated?: boolean;
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
    "bg-accent/20", "bg-blue-500/20", "bg-emerald-500/20",
    "bg-purple-500/20", "bg-rose-500/20", "bg-amber-500/20",
    "bg-cyan-500/20", "bg-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++)
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getAvatarTextColor(name: string | null): string {
  if (!name) return "text-text-secondary";
  const colors = [
    "text-accent", "text-blue-400", "text-emerald-400", "text-purple-400",
    "text-rose-400", "text-amber-400", "text-cyan-400", "text-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++)
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function ReviewCard({
  review,
  isOwn = false,
  onEdit,
  onDelete,
  isAuthenticated = false,
  className,
}: ReviewCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const handleReply = useCallback(async () => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to submit reply");
      setReplyText("");
      setReplyOpen(false);
    } catch {
      setReplyError("Failed to send reply");
    } finally {
      setReplySubmitting(false);
    }
  }, [replyText, review.id]);

  const handleReport = useCallback(async () => {
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (!res.ok) throw new Error("Failed to report");
      setReported(true);
      setReportOpen(false);
      setReportReason("");
    } catch {
      setReplyError("Failed to submit report");
    } finally {
      setReportSubmitting(false);
    }
  }, [reportReason, review.id]);

  return (
    <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-1">
          {isAuthenticated && !isOwn && (
            <>
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-accent"
                aria-label="Reply"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              {!reported ? (
                <button
                  onClick={() => setReportOpen(!reportOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-error"
                  aria-label="Report"
                >
                  <Flag className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-[10px] text-text-secondary/60 px-1">Reported</span>
              )}
            </>
          )}
          {isOwn && (
            <>
              {onEdit && (
                <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-accent" aria-label="Edit review">
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-error" aria-label="Delete review">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-2">
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-text/90 whitespace-pre-wrap">
        {review.content}
      </p>

      {/* Reply form */}
      {replyOpen && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          {replyError && <p className="text-xs text-error">{replyError}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setReplyOpen(false); setReplyText(""); setReplyError(null); }}
              className="rounded-lg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={replySubmitting || !replyText.trim()}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
            >
              {replySubmitting ? "Sending..." : "Reply"}
            </button>
          </div>
        </div>
      )}

      {/* Report form */}
      {reportOpen && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why are you reporting this review?"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setReportOpen(false); setReportReason(""); }}
              className="rounded-lg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              disabled={reportSubmitting || !reportReason.trim()}
              className="rounded-lg bg-error px-3 py-1.5 text-xs font-semibold text-text transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
            >
              {reportSubmitting ? "Sending..." : "Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
