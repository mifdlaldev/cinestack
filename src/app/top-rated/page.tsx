import type { Metadata } from "next";
import { getTopRated } from "@/lib/tmdb";
import { getProvidersForMovies } from "@/lib/tmdb-providers";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 4200;

export const metadata: Metadata = {
  title: "Top Rated Movies",
  description:
    "The highest-rated movies of all time, as voted by the community.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TopRatedPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getTopRated(page ? Number(page) : undefined);
  const providersMap = await getProvidersForMovies(
    data.results.map((m) => m.id),
  );

  return (
    <CategoryPageContent
      title="Top Rated"
      description="The highest-rated movies of all time."
      data={data}
      basePath="/top-rated"
      providersMap={providersMap}
    />
  );
}
