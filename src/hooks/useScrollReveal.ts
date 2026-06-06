// ─────────────────────────────────────────────────────────────
// useScrollReveal — Intersection Observer hook for scroll reveal
// Respects prefers-reduced-motion
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  /** Threshold for visibility (0-1). Default: 0.15 */
  threshold?: number;
  /** Margin around root. Default: "-80px" */
  rootMargin?: string;
  /** Only trigger once. Default: true */
  once?: boolean;
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {},
) {
  const { threshold = 0.15, rootMargin = "-80px", once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(() => getPrefersReducedMotion());

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, isVisible]);

  return { ref, isVisible };
}
