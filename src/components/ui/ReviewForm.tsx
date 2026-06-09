// ─────────────────────────────────────────────────────────────
// ReviewForm — Review submission / edit form
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ReviewFormValues } from "@/types/review";

// ─── Validation schema ───────────────────────────────────────

const reviewFormSchema = z.object({
  rating: z.number().int().min(1, "Please select a rating").max(10),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be at most 1000 characters"),
});

// ─── Props ───────────────────────────────────────────────────

interface ReviewFormProps {
  defaultValues?: Partial<ReviewFormValues>;
  onSubmit: (data: ReviewFormValues) => Promise<{ error?: string } | void>;
  onCancel?: () => void;
  isEditing?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────

export function ReviewForm({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing = false,
  className,
}: ReviewFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: defaultValues?.rating ?? 0,
      content: defaultValues?.content ?? "",
    },
  });

  const currentRating = watch("rating");
  const currentContent = watch("content");

  const handleFormSubmit = async (data: ReviewFormValues) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const result = await onSubmit(data);
      if (result?.error) {
        setServerError(result.error);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const charsLeft = 1000 - (currentContent?.length ?? 0);

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-4 rounded-xl border border-border bg-surface p-5", className)}
    >
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-text">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h3>
      </div>

      {/* Rating selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-secondary">
          Rating
        </label>
        <StarRating
          rating={currentRating}
          onChange={(val) => setValue("rating", val, { shouldValidate: true })}
          size="sm"
        />
        {errors.rating && (
          <p className="text-xs text-error">{errors.rating.message}</p>
        )}
      </div>

      {/* Content textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="review-content"
          className="block text-xs font-medium text-text-secondary"
        >
          Your Review
        </label>
        <Textarea
          id="review-content"
          {...register("content")}
          rows={4}
          placeholder="What did you think of this movie?"
          className="resize-none"
          aria-invalid={!!errors.content}
        />
        <div className="flex items-center justify-between">
          {errors.content ? (
            <p className="text-xs text-error">{errors.content.message}</p>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "text-xs",
              charsLeft < 50 ? "text-error" : "text-text-secondary",
            )}
          >
            {charsLeft}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
              {isEditing ? "Saving..." : "Submitting..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Submit Review"
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-lg bg-error/10 px-4 py-3">
          <p className="text-sm text-error">{serverError}</p>
        </div>
      )}
    </form>
  );
}
