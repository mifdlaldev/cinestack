// ─────────────────────────────────────────────────────────────
// NewsCard — Article card for listing pages
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { NewsArticle, NewsAuthor } from "@/types/news";
import { normalizeAuthor } from "@/types/news";

interface NewsCardProps {
  article: Pick<
    NewsArticle,
    "title" | "slug" | "excerpt" | "cover_image" | "published_at" | "created_at"
  > & { author: NewsAuthor };
  /** Stagger delay in seconds. Default: 0 */
  delay?: number;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readingTime(text: string | null): number {
  if (!text) return 1;
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function NewsCard({ article, delay = 0 }: NewsCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const author = normalizeAuthor(article.author);

  const cardContent = (
    <Link
      href={`/news/${article.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:scale-[1.02] hover:border-accent/30 hover:shadow-[0_0_30px_rgba(245,197,24,0.08)]"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-bg-alt">
            <span className="font-display text-4xl text-accent/30">
              CN
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="space-y-3 p-4 md:p-5">
        <h3 className="line-clamp-2 font-display text-lg leading-tight text-text transition-colors group-hover:text-accent">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          {author?.name && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {author.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.published_at ?? article.created_at ?? null)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readingTime(article.excerpt ?? article.title)} min read
          </span>
        </div>
      </div>
    </Link>
  );

  if (shouldReduceMotion) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {cardContent}
    </motion.div>
  );
}
