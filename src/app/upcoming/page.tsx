import type { Metadata } from "next";
import { getUpcoming } from "@/lib/tmdb";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 3600;

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

  return (
    <CategoryPageContent
      title="Upcoming"
      description="Movies coming soon to theaters."
      data={data}
      basePath="/upcoming"
    />
  );
}
