import Link from "next/link";
import type { TmdbPaginatedResponse, TmdbMovie, TmdbWatchProvider } from "@/types/tmdb";
import { MovieGrid } from "./MovieGrid";

interface CategoryPageContentProps {
  title: string;
  description: string;
  data: TmdbPaginatedResponse<TmdbMovie>;
  basePath: string;
  providersMap?: Record<number, TmdbWatchProvider[]>;
}

export function CategoryPageContent({
  title,
  description,
  data,
  basePath,
  providersMap,
}: CategoryPageContentProps) {
  const { results, page, total_pages } = data;
  const maxPages = Math.min(total_pages, 500); // TMDB caps at 500

  // Generate page numbers to show (max 7 around current page)
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const range = 3;
    const start = Math.max(1, page - range);
    const end = Math.min(maxPages, page + range);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < maxPages) {
      if (end < maxPages - 1) pages.push("...");
      pages.push(maxPages);
    }
    return pages;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-text-secondary">{description}</p>
      </div>

      {/* Movie grid */}
      <MovieGrid movies={results} providersMap={providersMap} />

      {/* Pagination */}
      <nav
        className="mt-10 flex items-center justify-center gap-2"
        aria-label="Page navigation"
      >
        {page > 1 && (
          <Link
            href={`${basePath}?page=${page - 1}`}
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text"
          >
            Previous
          </Link>
        )}

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-sm text-text-secondary"
            >
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={`${basePath}?page=${p}`}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                p === page
                  ? "bg-accent font-semibold text-bg"
                  : "text-text-secondary hover:bg-surface hover:text-text"
              }`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          ),
        )}

        {page < maxPages && (
          <Link
            href={`${basePath}?page=${page + 1}`}
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text"
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
