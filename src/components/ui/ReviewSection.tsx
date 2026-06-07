// ─────────────────────────────────────────────────────────────
// ReviewSection — Full review section for movie detail page
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import { submitReview, updateReview, deleteReview } from "@/actions/review-actions";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Pagination } from "./Pagination";
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
  const res = await fetch(`/api/reviews?movieId=${movieId}&page=${page}`);
  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }
  return res.json();
}

// ─── Component ───────────────────────────────────────────────

export function ReviewSection({ movieId }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // ── Check auth state on mount ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
      } catch {
        setCurrentUserId(null);
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

  // ── Find user's own review ──
  const userReview = currentUserId
    ? reviewsData?.data?.find((r) => r.user_id === currentUserId) ?? null
    : null;

  // ── Invalidate reviews cache ──
  const invalidateReviews = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reviews", movieId] });
  }, [queryClient, movieId]);

  // ── Submit new review ──
  const createMutation = useMutation({
    mutationFn: async (formData: ReviewFormValues) => {
      const result = await submitReview({ movieId, ...formData });
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      invalidateReviews();
    },
  });

  // ── Update existing review ──
  const editMutation = useMutation({
    mutationFn: async ({
      reviewId,
      formData,
    }: {
      reviewId: string;
      formData: ReviewFormValues;
    }) => {
      const result = await updateReview(reviewId, formData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setEditingReview(null);
      invalidateReviews();
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
      // Optimistic removal
      await queryClient.cancelQueries({ queryKey: ["reviews", movieId, page] });
      const previousData = queryClient.getQueryData<ReviewsResponse>([
        "reviews",
        movieId,
        page,
      ]);
      if (previousData) {
        queryClient.setQueryData<ReviewsResponse>(["reviews", movieId, page], {
          ...previousData,
          data: previousData.data.filter((r) => r.id !== reviewId),
          count: previousData.count - 1,
        });
      }
      return { previousData };
    },
    onError: (_err, _reviewId, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(["reviews", movieId, page], context.previousData);
      }
    },
    onSettled: () => {
      setDeletingId(null);
      invalidateReviews();
    },
  });

  // ── Handle form submit ──
  const handleFormSubmit = async (formData: ReviewFormValues) => {
    if (editingReview) {
      await editMutation.mutateAsync({ reviewId: editingReview.id, formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  // ── Handle edit click ──
  const handleEdit = (review: Review) => {
    setEditingReview(review);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Handle delete click ──
  const handleDelete = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      deleteMutation.mutate(reviewId);
    }
  };

  // ── Handle cancel edit ──
  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  // ── Determine which reviews to display ──
  // If editing, exclude the review being edited from the list
  const displayedReviews = editingReview
    ? reviewsData?.data?.filter((r) => r.id !== editingReview.id) ?? []
    : reviewsData?.data ?? [];

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
      {!authLoading && currentUserId && (!userReview || editingReview) && (
        <div className="mb-8">
          <ReviewForm
            key={editingReview?.id ?? "new"}
            defaultValues={
              editingReview
                ? { rating: editingReview.rating, content: editingReview.content }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={editingReview ? handleCancelEdit : undefined}
            isEditing={!!editingReview}
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
      {!isLoading && !isError && displayedReviews.length === 0 && !editingReview && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            {currentUserId
              ? "Be the first to review this movie!"
              : "No reviews yet."}
          </p>
        </div>
      )}

      {/* ── Reviews list ── */}
      {!isLoading && !isError && displayedReviews.length > 0 && (
        shouldReduceMotion ? (
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwn={review.user_id === currentUserId}
                onEdit={
                  review.user_id === currentUserId
                    ? () => handleEdit(review)
                    : undefined
                }
                onDelete={
                  review.user_id === currentUserId
                    ? () => handleDelete(review.id)
                    : undefined
                }
                className={
                  deletingId === review.id
                    ? "opacity-50 transition-opacity"
                    : ""
                }
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {displayedReviews.map((review) => (
              <motion.div
                key={review.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
              >
                <ReviewCard
                  review={review}
                  isOwn={review.user_id === currentUserId}
                  onEdit={
                    review.user_id === currentUserId
                      ? () => handleEdit(review)
                      : undefined
                  }
                  onDelete={
                    review.user_id === currentUserId
                      ? () => handleDelete(review.id)
                      : undefined
                  }
                  className={
                    deletingId === review.id
                      ? "opacity-50 transition-opacity"
                      : ""
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )
      )}

      {/* ── Pagination ── */}
      {reviewsData && reviewsData.totalPages > 1 && (
        <Pagination
          currentPage={reviewsData.page}
          totalPages={reviewsData.totalPages}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
