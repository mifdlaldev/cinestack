"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";

interface ReplyUser {
  name: string | null;
  avatar_url: string | null;
  email: string;
}

interface Reply {
  id: string;
  user_id: string;
  movie_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string;
  user: ReplyUser | null;
  movie_title: string;
}

interface RepliesResponse {
  data: Reply[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-error" />
            <h3 className="font-display text-lg text-text">{title}</h3>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRepliesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Reply | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    setSearchTimer(timer);
  }, [searchTimer]);

  const { data, isLoading, isError } = useQuery<RepliesResponse>({
    queryKey: ["admin-replies", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/replies?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? "Failed to fetch replies");
      }
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (replyId: string) => {
      const res = await fetch(`/api/admin/reviews/${replyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? "Failed to delete reply");
      }
    },
    onMutate: async (replyId) => {
      setDeletingId(replyId);
      await queryClient.cancelQueries({ queryKey: ["admin-replies", page, debouncedSearch] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-replies"] });
      setDeleteTarget(null);
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            Replies
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage user replies to reviews
            {data && <span className="ml-1">({data.count} total)</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by user name or email..."
          className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-text placeholder:text-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-6 py-12 text-center">
          <p className="text-sm text-error">Failed to load replies. Please try again.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (data?.data ?? []).length === 0 && (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-text-secondary/30" />
          <p className="text-sm text-text-secondary">No replies found.</p>
        </div>
      )}

      {/* Replies list */}
      {!isLoading && !isError && (data?.data ?? []).length > 0 && (
        <div className="space-y-3">
          {(data?.data ?? []).map((reply) => (
            <div
              key={reply.id}
              className={`rounded-xl border border-border bg-surface p-5 transition-opacity ${
                deletingId === reply.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Avatar + info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                    {(reply.user?.name ?? "?")[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-text">
                        {reply.user?.name ?? "Anonymous"}
                      </span>
                      <span className="text-[10px] text-text-secondary/60">
                        {reply.user?.email ?? ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text/90 leading-relaxed">
                      {reply.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text-secondary/60">
                      <span>{formatRelativeTime(reply.created_at)}</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Reply to review #{reply.parent_id.slice(0, 8)}
                      </span>
                      <span>{reply.movie_title}</span>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteTarget(reply)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
                  aria-label={`Delete reply by ${reply.user?.name ?? "anonymous"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Delete Reply"
        message={`Are you sure you want to delete this reply by "${deleteTarget?.user?.name ?? "anonymous"}"? This action cannot be undone.`}
      />
    </div>
  );
}
