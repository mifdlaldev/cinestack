"use client";

import { useState, useCallback } from "react";
import { Pencil, Trash2, MessageCircle, Star, Loader2 } from "lucide-react";
import { StarRating } from "./StarRating";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReplySuccess?: () => void;
  isAuthenticated?: boolean;
  className?: string;
  parentAuthorName?: string;
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
  onReplySuccess,
  isAuthenticated = false,
  className,
  parentAuthorName,
}: ReviewCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState<number>(review.rating ?? 1);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
      onReplySuccess?.();
    } catch {
      setReplyError("Failed to send reply");
    } finally {
      setReplySubmitting(false);
    }
  }, [replyText, review.id, onReplySuccess]);

  const startEditing = () => {
    setEditContent(review.content);
    setEditRating(review.rating || 1);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError(null);
  };

  const saveEditing = async () => {
    if (!editContent.trim() || editContent.length < 1) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, content: editContent.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? "Failed to update review");
      }
      setEditing(false);
      onReplySuccess?.(); // refetch reviews
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setEditSubmitting(false);
    }
  };

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
              {review.created_at !== review.updated_at && editing === false && " (edited)"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isAuthenticated && !isOwn && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-accent"
              aria-label="Reply"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
          {isOwn && !editing && (
            <>
              <button onClick={startEditing} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-accent" aria-label="Edit review">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-error" aria-label="Delete review">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* "Replying to" context — shown on any reply */}
      {parentAuthorName && (
        <p className="-mt-1.5 mb-2 text-xs text-text-secondary">
          Replying to{" "}
          <span className="font-medium text-text">
            @{parentAuthorName}
          </span>
        </p>
      )}

      {/* Rating — hidden for replies */}
      {!review.parent_id && review.rating && !editing && (
        <div className="mb-2">
          <StarRating rating={review.rating > 5 ? Math.round(review.rating / 2) : review.rating} readonly size="sm" />
        </div>
      )}

      {/* Edit mode */}
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value.slice(0, 1000))}
            rows={3}
            maxLength={1000}
            autoFocus
            className="w-full resize-none rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          {!review.parent_id && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Rating:</label>
              <StarRating
                rating={editRating > 5 ? Math.round(editRating / 2) : editRating}
                onChange={(val) => setEditRating(val)}
                size="sm"
              />
            </div>
          )}
          {editError && <p className="text-xs text-error">{editError}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelEditing}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={saveEditing}
              disabled={editSubmitting || !editContent.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
            >
              {editSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Content */}
          <p className="text-sm leading-relaxed text-text/90 whitespace-pre-wrap">
            {review.content}
          </p>
        </>
      )}

      {/* Reply form */}
      {replyOpen && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <textarea
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value.slice(0, 1000));
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="Write a reply..."
            rows={1}
            maxLength={1000}
            className="w-full resize-none overflow-hidden rounded-lg border border-border bg-bg-alt px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
          <div className="flex items-center justify-between">
            {replyError && <p className="text-xs text-error">{replyError}</p>}
            {!replyError && <span />}
            <span className={`text-xs ${replyText.length > 950 ? "text-error" : "text-text-secondary"}`}>
              {replyText.length}/1000
            </span>
          </div>
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
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
            >
              {replySubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
