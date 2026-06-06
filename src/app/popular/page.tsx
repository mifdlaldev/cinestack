import type { Metadata } from "next";
import { getPopular } from "@/lib/tmdb";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Popular Movies",
  description:
    "Browse the most popular movies worldwide. Updated regularly.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function PopularPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getPopular(page ? Number(page) : undefined);

  return (
    <CategoryPageContent
      title="Popular"
      description="The most popular movies right now."
      data={data}
      basePath="/popular"
    />
  );
}
