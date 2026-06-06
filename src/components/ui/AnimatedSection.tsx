// ─────────────────────────────────────────────────────────────
// AnimatedSection — Framer Motion fade-up scroll-reveal wrapper
// Respects prefers-reduced-motion
// ─────────────────────────────────────────────────────────────

"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. Default: 0 */
  delay?: number;
  /** Animation direction. Default: "up" */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Animation distance in pixels. Default: 30 */
  distance?: number;
  /** Duration in seconds. Default: 0.6 */
  duration?: number;
  /** Ease curve. Default: [0.16, 1, 0.3, 1] */
  ease?: [number, number, number, number];
  /** Intersection observer margin. Default: "-80px" */
  margin?: string;
  /** Animate only once. Default: true */
  once?: boolean;
}

const defaultEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

function getVariants(
  direction: "up" | "down" | "left" | "right" | "none",
  distance: number,
): Variants {
  const offset = { x: 0, y: 0 };
  switch (direction) {
    case "up":
      offset.y = distance;
      break;
    case "down":
      offset.y = -distance;
      break;
    case "left":
      offset.x = distance;
      break;
    case "right":
      offset.x = -distance;
      break;
    case "none":
      break;
  }

  return {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 30,
  duration = 0.6,
  ease = defaultEase,
  margin = "-80px",
  once = true,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, render without animation
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={getVariants(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
