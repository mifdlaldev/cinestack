import type { Metadata } from "next";
import type { TmdbWatchProvider } from "@/types/tmdb";
import { getNowPlaying } from "@/lib/tmdb";
import { getProvidersForMovies } from "@/lib/tmdb-providers";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Now Playing",
  description: "Movies currently playing in theaters near you.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NowPlayingPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getNowPlaying(page ? Number(page) : undefined);

  let providersMap: Record<number, TmdbWatchProvider[]> = {};
  try {
    providersMap = await getProvidersForMovies(data.results.map((m) => m.id));
  } catch {
    // Providers are optional — page still renders without them
  }

  return (
    <CategoryPageContent
      title="Now Playing"
      description="Movies currently playing in theaters."
      data={data}
      basePath="/now-playing"
      providersMap={providersMap}
    />
  );
}
