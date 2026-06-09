import type { TmdbMovie } from "@/types/tmdb";
import { getProvidersForMovies } from "@/lib/tmdb-providers";
import { MovieRow } from "./MovieRow";

interface MovieRowWithProvidersProps {
  title: string;
  movies: TmdbMovie[];
  href?: string;
}

export async function MovieRowWithProviders({
  title,
  movies,
  href,
}: MovieRowWithProvidersProps) {
  const movieIds = movies.map((m) => m.id);
  const providersMap = await getProvidersForMovies(movieIds);

  return (
    <MovieRow
      title={title}
      movies={movies}
      providersMap={providersMap}
      href={href}
    />
  );
}
