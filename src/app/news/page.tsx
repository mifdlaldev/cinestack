// ─────────────────────────────────────────────────────────────
// News Listing Page — Published articles, paginated
// ─────────────────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { NewsCard } from "@/components/ui/NewsCard";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import type { NewsAuthor } from "@/types/news";

export const metadata: Metadata = {
  title: "Latest News",
  description:
    "Stay updated with the latest movie news, trending films, and industry updates on CineStack.",
};

export const revalidate = 3600;

const PAGE_SIZE = 9;

// ─── Props ───────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ page?: string }>;
}

// ─── News List Content ───────────────────────────────────────

async function NewsList({ page }: { page: number }) {
  const supabase = await createClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: articles, count } = await supabase
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
      { count: "exact" },
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Newspaper className="h-12 w-12 text-text-secondary/20" />
        <h2 className="font-display text-xl text-text">No articles yet</h2>
        <p className="mt-2 text-text-secondary">
          Check back soon for the latest movie news.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-12 flex items-center justify-center gap-2"
          aria-label="Page navigation"
        >
          {page > 1 && (
            <Link
              href={`/news?page=${page - 1}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface hover:text-text"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, and pages around current
              return (
                p === 1 ||
                p === totalPages ||
                Math.abs(p - page) <= 2
              );
            })
            .map((p, idx, arr) => {
              const showEllipsis =
                idx > 0 && p - arr[idx - 1] > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {showEllipsis && (
                    <span className="px-1 text-sm text-text-secondary">
                      ...
                    </span>
                  )}
                  <Link
                    href={`/news?page=${p}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-accent font-semibold text-bg"
                        : "text-text-secondary hover:bg-surface hover:text-text"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}

          {page < totalPages && (
            <Link
              href={`/news?page=${page + 1}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface hover:text-text"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────

function NewsListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
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
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function NewsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-12 lg:px-8">
      {/* Page header */}
      <div className="pt-10 mb-10">
        <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl">
          Latest News
        </h1>
        <p className="mt-2 max-w-[600px] text-text-secondary">
          Stay updated with the latest movie news, trending films, and
          industry updates from around the world.
        </p>
      </div>

      <Suspense fallback={<NewsListSkeleton />} key={currentPage}>
        <NewsList page={currentPage} />
      </Suspense>
    </div>
  );
}
