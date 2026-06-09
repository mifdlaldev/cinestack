import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MovieCardSkeleton } from "@/components/ui/MovieCardSkeleton";

export const revalidate = 2700;

function RowSkeleton() {
  return (
    <div className="flex gap-4 sm:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-[160px] flex-shrink-0 sm:w-[180px] md:w-[200px]">
          <MovieCardSkeleton />
        </div>
      ))}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-surface" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [
    { HeroSection },
    { MovieRowWithProviders },
    { MyServicesRow },
    { NewsSection },
  ] = await Promise.all([
    import("@/components/layout/HeroSection"),
    import("@/components/ui/MovieRowWithProviders"),
    import("@/components/ui/MyServicesRow"),
    import("@/components/ui/NewsSection"),
  ]);

  const { getTrendingCached, getPopular, getTopRated, getUpcoming, getNowPlaying } = await import("@/lib/tmdb");

  const [trending, popular, topRated, upcoming, nowPlaying] = await Promise.all([
    getTrendingCached(),
    getPopular(),
    getTopRated(),
    getUpcoming(),
    getNowPlaying(),
  ]);

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-dvh bg-surface animate-pulse" />
        }
      >
        <HeroSection movies={trending.results} />
      </Suspense>

      <div className="mx-auto max-w-[1400px] space-y-10 px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <Suspense fallback={null}>
          <ErrorBoundary fallback={null}>
            <MyServicesRow />
          </ErrorBoundary>
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <MovieRowWithProviders
            title="Trending Now"
            movies={trending.results.slice(0, 16)}
            href="/trending"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <MovieRowWithProviders
            title="Popular"
            movies={popular.results.slice(0, 16)}
            href="/popular"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <MovieRowWithProviders
            title="Top Rated"
            movies={topRated.results.slice(0, 16)}
            href="/top-rated"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <MovieRowWithProviders
            title="Upcoming"
            movies={upcoming.results.slice(0, 16)}
            href="/upcoming"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <MovieRowWithProviders
            title="Now Playing"
            movies={nowPlaying.results.slice(0, 16)}
            href="/now-playing"
          />
        </Suspense>

        <Suspense fallback={<NewsSkeleton />}>
          <NewsSection />
        </Suspense>
      </div>
    </>
  );
}
