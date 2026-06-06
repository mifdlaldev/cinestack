// ─────────────────────────────────────────────────────────────
// StaggerContainer — Framer Motion stagger wrapper for grid/row
// Respects prefers-reduced-motion
// ─────────────────────────────────────────────────────────────

"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between each child in seconds. Default: 0.05 */
  staggerDelay?: number;
  /** Initial y offset. Default: 20 */
  yOffset?: number;
  /** Duration per child. Default: 0.5 */
  duration?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

function itemVariants(yOffset: number, duration: number): Variants {
  return {
    hidden: {
      opacity: 0,
      y: yOffset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  yOffset = 20,
  duration = 0.5,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {motionChildren(children, yOffset, duration)}
    </motion.div>
  );
}

/**
 * Recursively wraps each child with motion.div for stagger animation.
 */
function motionChildren(
  children: ReactNode,
  yOffset: number,
  duration: number,
): ReactNode {
  const variants = itemVariants(yOffset, duration);
  return (
    <>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={variants} style={{ willChange: "transform, opacity" }}>
              {child}
            </motion.div>
          ))
        : children}
    </>
  );
}
