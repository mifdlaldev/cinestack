// ─────────────────────────────────────────────────────────────
// Review Server Actions — submit, update, delete
// ─────────────────────────────────────────────────────────────

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ─── Validation schemas ──────────────────────────────────────

const submitReviewSchema = z.object({
  movieId: z.number().int().positive(),
  rating: z.number().int().min(1).max(10),
  content: z.string().min(1, "Review cannot be empty").max(1000, "Review must be at most 1000 characters"),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(10),
  content: z.string().min(1, "Review cannot be empty").max(1000, "Review must be at most 1000 characters"),
});

// ─── Action result type ──────────────────────────────────────

export type ReviewActionResult = {
  error?: string;
  data?: {
    id: string;
    rating: number;
    content: string;
    created_at: string;
    updated_at: string;
  };
};

// ─── Submit review ───────────────────────────────────────────

export async function submitReview(
  formData: z.infer<typeof submitReviewSchema>,
): Promise<ReviewActionResult> {
  const parsed = submitReviewSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: firstError };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to leave a review" };
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      movie_id: parsed.data.movieId,
      rating: parsed.data.rating,
      content: parsed.data.content,
    })
    .select("id, rating, content, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already reviewed this movie" };
    }
    return { error: error.message };
  }

  revalidatePath(`/movies/${parsed.data.movieId}`);
  return { data };
}

// ─── Update review ────────────────────────────────────────────

export async function updateReview(
  reviewId: string,
  formData: z.infer<typeof updateReviewSchema>,
): Promise<ReviewActionResult> {
  const parsed = updateReviewSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: firstError };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update a review" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("reviews")
    .select("user_id, movie_id")
    .eq("id", reviewId)
    .single();

  if (!existing) {
    return { error: "Review not found" };
  }

  if (existing.user_id !== user.id) {
    return { error: "You can only edit your own reviews" };
  }

  const { data, error } = await supabase
    .from("reviews")
    .update({
      rating: parsed.data.rating,
      content: parsed.data.content,
    })
    .eq("id", reviewId)
    .select("id, rating, content, created_at, updated_at")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/movies/${existing.movie_id}`);
  return { data };
}

// ─── Delete review ───────────────────────────────────────────

export async function deleteReview(
  reviewId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete a review" };
  }

  // Verify ownership (RLS will also block, but we need movie_id for revalidation)
  const { data: existing } = await supabase
    .from("reviews")
    .select("user_id, movie_id")
    .eq("id", reviewId)
    .single();

  if (!existing) {
    return { error: "Review not found" };
  }

  if (existing.user_id !== user.id) {
    return { error: "You can only delete your own reviews" };
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/movies/${existing.movie_id}`);
  return {};
}
