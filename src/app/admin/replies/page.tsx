"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
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
  parent_id?: string | null;
  user: ReplyUser | null;
  movie_title: string;
  parentAuthorName?: string | null;
  parentContent?: string | null;
}

interface RepliesResponse {
  data: Reply[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
    "bg-accent/20", "bg-blue-500/20", "bg-emerald-500/20", "bg-purple-500/20",
    "bg-rose-500/20", "bg-amber-500/20", "bg-cyan-500/20", "bg-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++)
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
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
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Reply | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    },
    [],
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, []);

  const { data, isLoading, isError } = useQuery<RepliesResponse>({
    queryKey: ["admin-replies", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
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
      await queryClient.cancelQueries({ queryKey: ["admin-replies", page, search] });
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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by user name or email..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {searchInput.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-secondary transition-colors hover:text-text"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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

      {/* Replies table */}
      {!isLoading && !isError && (data?.data ?? []).length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Movie</th>
                <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">Content</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Message Date</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Time</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.data ?? []).map((reply) => (
                <tr
                  key={reply.id}
                  className={`bg-bg transition-colors hover:bg-surface/50 ${deletingId === reply.id ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {reply.user?.avatar_url ? (
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={reply.user.avatar_url}
                            alt={reply.user?.name ?? "User"}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                            getAvatarColor(reply.user?.name ?? null)
                          }
                          aria-hidden="true"
                        >
                          {getInitials(reply.user?.name ?? null)}
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-text">
                          {reply.user?.name ?? "Anonymous"}
                        </span>
                        <p className="text-[10px] text-text-secondary/60">{reply.user?.email ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    <div className="flex flex-col">
                      <span>{reply.movie_title}</span>
                      {reply.parentAuthorName && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary/60">
                          <MessageCircle className="h-2.5 w-2.5" />
                          Replied to @{reply.parentAuthorName}
                          {reply.parentContent && (
                            <>: &ldquo;{reply.parentContent}&rdquo;</>
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden max-w-xs px-4 py-3 text-text-secondary md:table-cell">
                    <p className="line-clamp-1">{reply.content}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    {formatRelativeTime(reply.created_at)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    {new Date(reply.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    {new Date(reply.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit", hour12: false,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(reply)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
                      aria-label={`Delete reply by ${reply.user?.name ?? "anonymous"}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
