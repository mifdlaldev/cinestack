import type { Metadata } from "next";
import type { TmdbWatchProvider } from "@/types/tmdb";
import { getUpcoming } from "@/lib/tmdb";
import { getProvidersForMovies } from "@/lib/tmdb-providers";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 4500;

export const metadata: Metadata = {
  title: "Upcoming Movies",
  description:
    "See what movies are coming soon to theaters near you.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function UpcomingPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getUpcoming(page ? Number(page) : undefined);

  let providersMap: Record<number, TmdbWatchProvider[]> = {};
  try {
    providersMap = await getProvidersForMovies(data.results.map((m) => m.id));
  } catch {
    // Providers are optional — page still renders without them
  }

  return (
    <CategoryPageContent
      title="Upcoming"
      description="Movies coming soon to theaters."
      data={data}
      basePath="/upcoming"
      providersMap={providersMap}
    />
  );
}
