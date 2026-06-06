import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMovieGenres, discoverMovies } from "@/lib/tmdb";
import { MovieGrid } from "@/components/ui/MovieGrid";
import { GenrePagination } from "./pagination";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600; // ISR — 1 hour

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const genreId = Number(id);

  if (Number.isNaN(genreId)) {
    return { title: "Genre Not Found" };
  }

  const genres = await getMovieGenres().catch(() => []);
  const genre = genres.find((g) => g.id === genreId);

  if (!genre) {
    return { title: "Genre Not Found" };
  }

  return {
    title: `${genre.name} Movies`,
    description: `Browse the best ${genre.name.toLowerCase()} movies. Discover top-rated and popular ${genre.name.toLowerCase()} films.`,
  };
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const genreId = Number(id);
  const currentPage = Math.max(1, Number(pageStr) || 1);

  if (Number.isNaN(genreId)) {
    notFound();
  }

  const genres = await getMovieGenres().catch(() => []);
  const genre = genres.find((g) => g.id === genreId);

  if (!genre) {
    notFound();
  }

  const data = await discoverMovies({
    genreId,
    sortBy: "popularity.desc",
    page: currentPage,
  });

  const totalPages = Math.min(data.total_pages, 500); // TMDB caps at 500

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/discover"
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl">
          {genre.name}{" "}
          <span className="text-text-secondary">Movies</span>
        </h1>
        <p className="mt-2 text-text-secondary">
          {data.total_results.toLocaleString()} movies found
        </p>
      </header>

      {/* Results */}
      {data.results.length > 0 ? (
        <>
          <MovieGrid movies={data.results} />
          <GenrePagination
            currentPage={currentPage}
            totalPages={totalPages}
            genreId={genreId}
          />
        </>
      ) : (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border px-6 py-16">
          <div className="text-center">
            <p className="text-lg font-medium text-text-secondary">
              No movies found in this genre.
            </p>
            <Link
              href="/discover"
              className="mt-3 inline-block text-sm text-accent transition-colors hover:text-accent-hover"
            >
              Try the Discover page
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
