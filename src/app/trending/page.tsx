import type { Metadata } from "next";
import { getTrending } from "@/lib/tmdb";
import { getProvidersForMovies } from "@/lib/tmdb-providers";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 3000;

export const metadata: Metadata = {
  title: "Trending Movies",
  description:
    "Discover the movies that everyone is talking about right now. Updated daily.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TrendingPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getTrending("week", page ? Number(page) : undefined);
  const providersMap = await getProvidersForMovies(
    data.results.map((m) => m.id),
  );

  return (
    <CategoryPageContent
      title="Trending Now"
      description="The movies everyone is watching right now."
      data={data}
      basePath="/trending"
      providersMap={providersMap}
    />
  );
}
