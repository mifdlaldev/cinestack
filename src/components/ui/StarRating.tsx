// ─────────────────────────────────────────────────────────────
// StarRating — Interactive & Display Modes (1-10)
// ─────────────────────────────────────────────────────────────

"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const starSize = sizeMap[size];

  if (readonly) {
    return (
      <div
        className={cn("inline-flex items-center gap-0.5", className)}
        aria-label={`Rating: ${rating} out of 10`}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              "transition-colors",
              i < rating
                ? "fill-accent text-accent"
                : "fill-none text-[#2a2a35]",
            )}
          />
        ))}
        <span className="ml-1 text-xs font-medium text-text-secondary">
          {rating}/10
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: 10 }, (_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            className={cn(
              starSize,
              "cursor-pointer transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              starValue <= rating
                ? "fill-accent text-accent"
                : "fill-none text-[#2a2a35] hover:text-accent/50",
            )}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            aria-checked={starValue === rating}
            role="radio"
          >
            <Star className="h-full w-full" />
          </button>
        );
      })}
    </div>
  );
}
