"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** If true, rating is on 0-10 scale and gets converted to 0-5. Default: false */
  fromTen?: boolean;
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
  fromTen = false,
}: StarRatingProps) {
  const stars = fromTen ? Math.round(rating / 2) : rating;
  const starSize = sizeMap[size];
  const maxStars = 5;

  if (readonly) {
    return (
      <div
        className={cn("inline-flex items-center gap-0.5", className)}
        aria-label={`Rating: ${stars} out of ${maxStars}`}
      >
        {Array.from({ length: maxStars }, (_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              "transition-colors",
              i < stars
                ? "fill-accent text-accent"
                : "fill-none text-[#2a2a35]",
            )}
          />
        ))}
        <span className="ml-1 text-xs font-medium text-text-secondary">
          {stars}/{maxStars}
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
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= stars;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue === stars ? 0 : starValue)}
            className={cn(
              starSize,
              "cursor-pointer transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            aria-checked={starValue === stars}
            role="radio"
          >
            <Star
              className={cn(
                "h-full w-full transition-colors",
                isFilled
                  ? "fill-accent text-accent"
                  : "fill-none text-[#2a2a35]",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
