// ─────────────────────────────────────────────────────────────
// Admin Reviews Management — List, search, delete reviews
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";

interface ReviewUser {
  name: string | null;
  avatar_url: string | null;
  email: string;
}

interface Review {
  id: string;
  user_id: string;
  movie_id: number;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: ReviewUser | null;
  movie_title: string;
}

interface ReviewsResponse {
  data: Review[];
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
    <>
      <div
        className="fixed inset-0 z-50 bg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <h3 className="font-display text-lg text-text">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-sm text-text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-bg px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ReviewsResponse>({
    queryKey: ["admin-reviews", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/reviews?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch reviews");
      }
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    },
    [searchInput],
  );

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    deleteMutation.mutate(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
          Reviews
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage user-submitted reviews
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4">
          <p className="text-sm text-error">
            {error instanceof Error ? error.message : "Failed to load reviews"}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Movie
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Rating
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-text-secondary"
                    >
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  data.data.map((review) => (
                    <tr
                      key={review.id}
                      className="bg-bg transition-colors hover:bg-surface/50"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-text">
                          {review.user?.name ?? "Anonymous"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {review.movie_title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-accent">
                          <Star className="h-3.5 w-3.5 fill-accent" />
                          <span className="font-semibold">{review.rating}</span>
                          <span className="text-text-secondary">/10</span>
                        </span>
                      </td>
                      <td className="hidden max-w-xs px-4 py-3 text-text-secondary md:table-cell">
                        <p className="line-clamp-1">{review.content}</p>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatRelativeTime(review.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              id: review.id,
                              label: `Review by ${review.user?.name ?? "Anonymous"} for ${review.movie_title}`,
                            })
                          }
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Delete mutation error */}
          {deleteMutation.isError && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-3">
              <p className="text-sm text-error">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Failed to delete review"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {data.page} of {data.totalPages} ({data.count} total reviews)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message={`Are you sure you want to delete this review? This action cannot be undone.`}
      />
    </div>
  );
}
