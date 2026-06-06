// ─────────────────────────────────────────────────────────────
// NewsSection — News section for the homepage
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { ChevronRight, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { NewsCard } from "./NewsCard";
import type { NewsAuthor } from "@/types/news";

export async function NewsSection() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("news_articles")
    .select(
      `
      title,
      slug,
      excerpt,
      cover_image,
      published_at,
      author:users(name, avatar_url)
    `,
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(3);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-accent" />
          <h2 className="font-display text-xl text-text md:text-2xl">
            Latest News
          </h2>
        </div>
        <Link
          href="/news"
          className="group flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
        >
          View All
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard
            key={article.slug}
            article={
              article as {
                title: string;
                slug: string;
                excerpt: string | null;
                cover_image: string | null;
                published_at: string | null;
                author: NewsAuthor;
              }
            }
          />
        ))}
      </div>
    </section>
  );
}

export function NewsSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded bg-surface" />
        <div className="h-8 w-36 animate-pulse rounded bg-surface" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-surface">
            <div className="aspect-[16/9] animate-pulse bg-surface-hover" />
            <div className="space-y-3 p-5">
              <div className="h-6 w-full animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
