import type { Metadata } from "next";
import { getNowPlaying } from "@/lib/tmdb";
import { CategoryPageContent } from "@/components/ui/CategoryPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Now Playing",
  description:
    "Find movies currently playing in theaters near you.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NowPlayingPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await getNowPlaying(page ? Number(page) : undefined);

  return (
    <CategoryPageContent
      title="Now Playing"
      description="Movies currently in theaters."
      data={data}
      basePath="/now-playing"
    />
  );
}
