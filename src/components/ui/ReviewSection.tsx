// ─────────────────────────────────────────────────────────────
// ReviewSection — Full review section for movie detail page
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { submitReview, deleteReview } from "@/actions/review-actions";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { MoviePagination } from "./MoviePagination";
import type { Review, ReviewFormValues } from "@/types/review";

// ─── Props ───────────────────────────────────────────────────

interface ReviewSectionProps {
  movieId: number;
}

// ─── Fetch reviews helper ────────────────────────────────────

interface ReviewsResponse {
  data: Review[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function fetchReviews(movieId: number, page: number): Promise<ReviewsResponse> {
  const res = await fetch(`/api/reviews?movieId=${movieId}&page=${page}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }
  return res.json();
}

// ─── Component ───────────────────────────────────────────────

export function ReviewSection({ movieId }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const toggleThread = (id: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Count total nested replies recursively
  const countNested = (id: string): number => {
    const nested = repliesByParent[id];
    if (!nested?.length) return 0;
    return nested.length + nested.reduce((sum, r) => sum + countNested(r.id), 0);
  };

  // ── Check auth state on mount ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();
          setCurrentUserProfile(
            profile ?? { name: null, avatar_url: null },
          );
        }
      } catch {
        setCurrentUserId(null);
        setCurrentUserProfile(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ── Fetch reviews ──
  const {
    data: reviewsData,
    isLoading,
    isError,
    error,
  } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", movieId, page],
    queryFn: () => fetchReviews(movieId, page),
    staleTime: 30_000,
  });

  // ── Recursive reply thread renderer ──
  const renderThread = (
    item: Review,
    depth = 0,
    parentAuthorName?: string,
  ): React.ReactNode => {
    const nested = repliesByParent[item.id];
    const totalNested = nested ? countNested(item.id) : 0;
    const isCollapsed = depth >= 2 && !expandedThreads.has(item.id);

    return (
      <div key={item.id}>
        <ReviewCard
          review={item}
          isOwn={item.user_id === currentUserId}
          isAuthenticated={!!currentUserId}
          onDelete={item.user_id === currentUserId ? () => handleDelete(item.id) : undefined}
          onReplySuccess={refetchReviews}
          parentAuthorName={parentAuthorName}
          className={deletingId === item.id ? "opacity-50 transition-opacity" : ""}
        />
        {nested?.length > 0 && (
          <>
            {isCollapsed ? (
              <button
                onClick={() => toggleThread(item.id)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
              >
                <span className="inline-block h-3 w-3 rounded-full border-2 border-accent" />
                See {totalNested} more repl{totalNested > 1 ? "ies" : "y"}
              </button>
            ) : (
              <>
                <div
                  className={
                    depth === 0
                      ? "ml-6 mt-3 space-y-3 border-l-2 border-border pl-4"
                      : "mt-3 space-y-3"
                  }
                >
                  {nested.map((reply) =>
                    renderThread(reply, depth + 1, item.user?.name ?? undefined),
                  )}
                </div>
                {depth >= 2 && (
                  <button
                    onClick={() => toggleThread(item.id)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text"
                  >
                    <span className="inline-block h-3 w-3 rounded-full border-2 border-text-secondary" />
                    Hide replies
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // ── Find user's own review ──
  // Only find non-reply reviews — replies don't count as "user's own review"
  const userReview = currentUserId
    ? reviewsData?.data?.find((r) => r.user_id === currentUserId && !r.parent_id) ?? null
    : null;

  // ── Force refetch reviews after mutation ──
  const refetchReviews = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reviews", movieId] });
  }, [queryClient, movieId]);

  // ── Submit new review ──
  const createMutation = useMutation({
    mutationFn: async (formData: ReviewFormValues) => {
      const result = await submitReview({ movieId, ...formData });
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (result) => {
      if (result?.data && currentUserId) {
        const current = queryClient.getQueryData<ReviewsResponse>(["reviews", movieId, page]);
        if (current?.data) {
          const newReview: Review = {
            id: result.data.id,
            user_id: currentUserId,
            movie_id: movieId,
            rating: result.data.rating,
            content: result.data.content,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at,
            parent_id: null,
            user: currentUserProfile ?? { name: null, avatar_url: null },
          };
          queryClient.setQueryData<ReviewsResponse>(["reviews", movieId, page], {
            ...current,
            data: [newReview, ...current.data],
            count: current.count + 1,
          });
        }
      }
      refetchReviews();
    },
  });

  // ── Delete review ──
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const result = await deleteReview(reviewId);
      if (result.error) throw new Error(result.error);
    },
    onMutate: async (reviewId) => {
      setDeletingId(reviewId);
      // Cancel any in-flight refetch so stale data doesn't overwrite
      await queryClient.cancelQueries({ queryKey: ["reviews", movieId] });
    },
    onError: () => {
      setDeletingId(null);
    },
    onSuccess: () => {
      // Hard reset — remove cached data so useQuery fetches fresh from API
      queryClient.resetQueries({ queryKey: ["reviews", movieId] });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // ── Handle form submit (new review only — edits are inline) ──
  const handleFormSubmit = async (formData: ReviewFormValues) => {
    await createMutation.mutateAsync(formData);
  };

  // ── Handle delete click ──
  const handleDelete = (reviewId: string) => {
    setDeleteConfirmId(reviewId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // ── Group reviews into parent + replies (YouTube-style nesting) ──
  const parentReviews = (reviewsData?.data ?? [])
    .filter((r) => !r.parent_id);

  const repliesByParent = (reviewsData?.data ?? [])
    .filter((r) => r.parent_id)
    .reduce<Record<string, Review[]>>((acc, r) => {
      const pid = r.parent_id!;
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push(r);
      return acc;
    }, {});

  return (
    <section className="mb-14">
      <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
        Reviews
        {reviewsData && (
          <span className="ml-2 font-sans text-base font-normal text-text-secondary">
            ({reviewsData.count})
          </span>
        )}
      </h2>

      {/* ── Auth loading ── */}
      {authLoading && (
        <div className="flex items-center justify-center py-8">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {/* ── Not logged in ── */}
      {!authLoading && !currentUserId && (
        <div className="mb-8 rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-sm text-text-secondary">
            <Link
              href="/login"
              className="font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Sign in
            </Link>{" "}
            to leave a review
          </p>
        </div>
      )}

      {/* ── Review form (logged in, not already have a review OR editing) ── */}
      {!authLoading && !isLoading && currentUserId && !userReview && (
        <div id="review-form-scroll" className="mb-8">
          <ReviewForm
            key="new"
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-surface p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-hover" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-surface-hover" />
                  <div className="h-3 w-16 rounded bg-surface-hover" />
                </div>
              </div>
              <div className="mb-2 h-4 w-40 rounded bg-surface-hover" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-surface-hover" />
                <div className="h-3 w-3/4 rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-sm text-error">
            {error instanceof Error ? error.message : "Failed to load reviews"}
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !isError && parentReviews.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            {currentUserId
              ? "Be the first to review this movie!"
              : "No reviews yet."}
          </p>
        </div>
      )}

      {/* ── Reviews list (YouTube-style nested) ── */}
      {!isLoading && !isError && parentReviews.length > 0 && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {parentReviews.map((review) => (
            <div key={review.id}>
              {renderThread(review)}
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Pagination ── */}
      {reviewsData && reviewsData.totalPages > 1 && (
        <MoviePagination
          currentPage={reviewsData.page}
          totalPages={reviewsData.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-error" />
                <h3 className="font-display text-lg text-text">Delete Review</h3>
              </div>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="text-text-secondary hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete your review? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
