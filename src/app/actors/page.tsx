import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTrendingActors, getProfileUrl } from "@/lib/tmdb";
import type { TmdbPerson } from "@/types/tmdb";
import { StaggerContainer } from "@/components/ui/StaggerContainer";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const revalidate = 7200;
export const metadata: Metadata = {
  title: "Trending Actors",
  description: "Discover trending actors and actresses in the movie world.",
};

// ─── Search params type ─────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

// ─── Actor Card ─────────────────────────────────────────────

const PLACEHOLDER_PROFILE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect fill='%231a1a24' width='300' height='450'/%3E%3Ccircle fill='%2324242e' cx='150' cy='135' r='60'/%3E%3Cpath fill='%2324242e' d='M45 390 Q150 255 255 390'/%3E%3C/svg%3E";

function ActorCard({ actor, priority }: { actor: TmdbPerson; priority?: boolean }) {
  const profileUrl = getProfileUrl(actor.profile_path, "h632");
  const knownFor = actor.known_for
    ?.slice(0, 2)
    .map((m) => m.title)
    .join(", ");

  return (
    <Link
      href={`/actors/${actor.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-alt">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={actor.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("${PLACEHOLDER_PROFILE}")`,
              backgroundSize: "cover",
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-text transition-colors group-hover:text-accent">
          {actor.name}
        </h3>
        <p className="text-xs text-text-secondary">
          {actor.known_for_department}
        </p>
        {knownFor && (
          <p className="line-clamp-1 text-xs text-text-secondary/70">
            {knownFor}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Skeleton Loading ───────────────────────────────────────

function ActorGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="aspect-[2/3] animate-pulse bg-surface-hover" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Actor Grid (Server Component) ─────────────────────────

async function ActorGrid({ page }: { page: number }) {
  const data = await getTrendingActors("week", page);
  const actors = data.results.filter((p) => p.known_for_department === "Acting");

  if (actors.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg text-text-secondary">No actors found.</p>
      </div>
    );
  }

  return (
    <>
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {actors.map((actor) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
      </StaggerContainer>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Actors pagination"
        >
          {page > 1 && (
            <Link
              href={`/actors?page=${page - 1}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text"
              aria-label="Previous page"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          <span className="px-4 text-sm text-text-secondary">
            Page {page} of {Math.min(data.total_pages, 500)}
          </span>

          {page < Math.min(data.total_pages, 500) && (
            <Link
              href={`/actors?page=${page + 1}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text"
              aria-label="Next page"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

// ─── Page ───────────────────────────────────────────────────

export default async function ActorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Math.min(500, Number(params?.page) || 1));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14 lg:px-8">
      <AnimatedSection>
        <div className="mb-10">
          <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl">
            Trending Actors
          </h1>
          <p className="mt-2 text-text-secondary">
            The most popular actors trending this week
          </p>
        </div>
      </AnimatedSection>

      <Suspense fallback={<ActorGridSkeleton />}>
        <ActorGrid page={currentPage} />
      </Suspense>
    </div>
  );
}
