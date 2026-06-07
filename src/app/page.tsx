import { Suspense } from "react";
import {
  getTrending,
  getPopular,
  getTopRated,
  getUpcoming,
  getNowPlaying,
} from "@/lib/tmdb";
import { HeroSection } from "@/components/layout/HeroSection";
import { MovieRow } from "@/components/ui/MovieRow";
import { MovieCardSkeleton } from "@/components/ui/MovieCardSkeleton";
import { MyServicesRow } from "@/components/ui/MyServicesRow";
import {
  NewsSection,
  NewsSectionSkeleton,
} from "@/components/ui/NewsSection";

export const revalidate = 3600;

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

async function TrendingHero() {
  const data = await getTrending("week");
  return <HeroSection movie={data.results[0]} />;
}

async function TrendingRow() {
  const data = await getTrending("week");
  return (
    <MovieRow
      title="Trending Now"
      movies={data.results.slice(0, 16)}
      href="/trending"
    />
  );
}

async function PopularRow() {
  const data = await getPopular();
  return (
    <MovieRow
      title="Popular"
      movies={data.results.slice(0, 16)}
      href="/popular"
    />
  );
}

async function TopRatedRow() {
  const data = await getTopRated();
  return (
    <MovieRow
      title="Top Rated"
      movies={data.results.slice(0, 16)}
      href="/top-rated"
    />
  );
}

async function UpcomingRow() {
  const data = await getUpcoming();
  return (
    <MovieRow
      title="Upcoming"
      movies={data.results.slice(0, 16)}
      href="/upcoming"
    />
  );
}

async function NowPlayingRow() {
  const data = await getNowPlaying();
  return (
    <MovieRow
      title="Now Playing"
      movies={data.results.slice(0, 16)}
      href="/now-playing"
    />
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-[70vh] bg-surface animate-pulse" />
        }
      >
        <TrendingHero />
      </Suspense>

      <div className="mx-auto max-w-[1400px] space-y-10 px-4 py-10 md:px-6 md:py-12 lg:px-8">
        {/* Smart row: available on user's streaming services */}
        <Suspense fallback={null}>
          <MyServicesRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <TrendingRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <PopularRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <TopRatedRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <UpcomingRow />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <NowPlayingRow />
        </Suspense>

        <Suspense fallback={<NewsSectionSkeleton />}>
          <NewsSection />
        </Suspense>
      </div>
    </>
  );
}
