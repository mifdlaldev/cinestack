// ─────────────────────────────────────────────────────────────
// Movie Detail Page — Server Component with ISR
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieVideos,
  getMovieWatchProviders,
  getSimilarMovies,
  getImageUrl,
  getBackdropUrl,
  TmdbApiError,
} from "@/lib/tmdb";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ShareButton } from "@/components/ui/ShareButton";
import { WatchlistButton } from "@/components/ui/WatchlistButton";

const ReviewSection = dynamic(() => import("@/components/ui/ReviewSection").then((m) => m.ReviewSection));
const CastCarousel = dynamic(() => import("@/components/ui/CastCarousel").then((m) => m.CastCarousel));
const SimilarMoviesSection = dynamic(() => import("@/components/ui/SimilarMoviesSection").then((m) => m.SimilarMoviesSection));
const WatchProvidersEnhanced = dynamic(() => import("@/components/ui/WatchProvidersEnhanced").then((m) => m.WatchProvidersEnhanced));
import type {
  TmdbCastMember,
  TmdbMovie,
  TmdbWatchProviders,
  TmdbMovieDetail,
  TmdbCredit,
  TmdbVideos,
  TmdbPaginatedResponse,
} from "@/types/tmdb";

// ─── ISR configuration ──────────────────────────────────────

export const revalidate = 5400;

// ─── Dynamic Metadata ───────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) return { title: "Movie Not Found" };

    const movie = await getMovieDetail(movieId);
    const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");

    return {
      title: movie.title,
      description:
        movie.tagline ?? movie.overview.slice(0, 160) ?? `${movie.title} — Movie details`,
      openGraph: {
        title: movie.title,
        description: movie.tagline ?? movie.overview.slice(0, 160),
        images: backdropUrl ? [{ url: backdropUrl, width: 1280, height: 720 }] : [],
        type: "video.movie",
      },
    };
  } catch {
    return { title: "Movie Not Found" };
  }
}

// ─── Static generation (ISR) ────────────────────────────────

export async function generateStaticParams() {
  try {
    const { getPopular } = await import("@/lib/tmdb");
    const data = await getPopular();
    return data.results.slice(0, 20).map((movie) => ({
      id: movie.id.toString(),
    }));
  } catch {
    return [];
  }
}

// ─── Helper: format runtime ─────────────────────────────────

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Helper: format currency ────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Main Page Component ────────────────────────────────────

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    notFound();
  }

  let movie: TmdbMovieDetail;
  let credits: TmdbCredit;
  let videos: TmdbVideos;
  let watchProviders: TmdbWatchProviders;
  let similar: TmdbPaginatedResponse<TmdbMovie>;
  try {
    const results = await Promise.all([
      getMovieDetail(movieId),
      getMovieCredits(movieId),
      getMovieVideos(movieId),
      getMovieWatchProviders(movieId),
      getSimilarMovies(movieId),
    ]);
    movie = results[0];
    credits = results[1];
    videos = results[2];
    watchProviders = results[3];
    similar = results[4];
  } catch (error) {
    if (error instanceof TmdbApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  // ── Extract trailer ──
  const trailer = videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube" && v.official,
  ) ?? videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube",
  ) ?? videos.results.find(
    (v) => v.type === "Trailer" && v.site === "Vimeo",
  );

  // ── Cast sorted by order, top 20 ──
  const cast = credits.cast
    .filter((c) => c.character)
    .slice(0, 20);

  // ── Backdrop & poster ──
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  // ── JSON-LD structured data ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview?.slice(0, 500) ?? undefined,
    image: posterUrl ?? undefined,
    datePublished: movie.release_date ?? undefined,
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average.toFixed(1),
      ratingCount: movie.vote_count,
      bestRating: "10",
    },
    genre: movie.genres.map((g) => g.name),
    actors: credits.cast.slice(0, 10).map((c) => ({
      "@type": "Person",
      name: c.name,
      ...(c.character ? { characterName: c.character } : {}),
    })),
  };

  return (
    <div>
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Section ── */}
        <section className="relative min-h-[60dvh] md:min-h-[70dvh] overflow-hidden">
          {/* Backdrop image */}
          {backdropUrl ? (
            <>
              <Image
                src={backdropUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-alt to-surface" />
          )}

          {/* Hero content */}
          <div className="relative mx-auto flex h-full min-h-[60dvh] max-w-[1400px] flex-col items-start justify-end gap-6 px-4 pb-10 pt-24 md:min-h-[70dvh] md:gap-10 md:px-6 md:pb-16 lg:px-8">
            {/* Poster */}
            <div className="relative w-48 flex-shrink-0 md:w-64 lg:w-72">
              <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-[0_0_30px_rgba(245,197,24,0.12)]">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface">
                    <span className="font-display text-6xl text-text-secondary/20">
                      ?
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex max-w-2xl flex-col gap-4">
              {/* Title & year */}
              <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl lg:text-5xl">
                {movie.title}
                {year ? (
                  <span className="ml-3 font-sans text-2xl font-normal text-text-secondary md:text-3xl lg:text-4xl">
                    ({year})
                  </span>
                ) : null}
              </h1>

              {/* Tagline */}
              {movie.tagline && (
                <p className="text-lg italic text-text-secondary">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-[20px] border border-accent/30 px-3 py-1.5">
                  <span className="text-sm text-accent">★</span>
                  <span className="text-sm font-bold text-accent">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-xs text-accent-dim">
                    ({movie.vote_count.toLocaleString()})
                  </span>
                </div>

                {/* Runtime */}
                <span className="text-sm text-text-secondary">
                  {formatRuntime(movie.runtime)}
                </span>

                {/* Release date */}
                {movie.release_date && (
                  <span className="text-sm text-text-secondary">
                    {new Date(movie.release_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Genres */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/discover?genre=${genre.id}`}
                      className="rounded-full border border-white/[0.06] bg-black/70 backdrop-blur-[20px] px-3 py-1 text-xs font-medium text-text"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <WatchlistButton movieId={movieId} />
                <ShareButton
                  title={movie.title}
                  text={
                    movie.tagline
                      ? `"${movie.tagline}" — ${movie.title}`
                      : movie.title
                  }
                  variant="button"
                />
              </div>

              {/* Overview */}
              {movie.overview && (
                <p className="max-w-prose text-base leading-relaxed text-text/90">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Content Sections ── */}
        <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 lg:px-8 md:py-14">
          {/* ── Cast Section ── */}
          {cast.length > 0 && (
            <CastCarousel cast={cast} />
          )}

          {/* ── Trailer Section ── */}
          {trailer && (
            <AnimatedSection>
              <section className="mb-14">
                <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
                  Trailer
                </h2>
                <div className="aspect-video w-full max-w-5xl mx-auto overflow-hidden rounded-xl">
                  <iframe
                    src={trailer.site === "Vimeo"
                      ? `https://player.vimeo.com/video/${trailer.key}`
                      : `https://www.youtube.com/embed/${trailer.key}`
                    }
                    title={trailer.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="h-full w-full"
                  />
                </div>
              </section>
            </AnimatedSection>
          )}

          {/* ── Watch Providers (Enhanced) ── */}
          {Object.keys(watchProviders.results).length > 0 && (
            <AnimatedSection>
              <section className="mb-14">
                <WatchProvidersEnhanced providers={watchProviders} />
              </section>
            </AnimatedSection>
          )}

          {/* ── Movie Details ── */}
          <AnimatedSection>
            <section className="mb-14">
              <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
                Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-4">
              {movie.budget > 0 && (
                <div className="rounded-lg bg-surface p-4">
                  <p className="text-xs text-text-secondary">Budget</p>
                  <p className="mt-1 font-semibold text-text">
                    {formatCurrency(movie.budget)}
                  </p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div className="rounded-lg bg-surface p-4">
                  <p className="text-xs text-text-secondary">Revenue</p>
                  <p className="mt-1 font-semibold text-text">
                    {formatCurrency(movie.revenue)}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-secondary">Status</p>
                <p className="mt-1 font-semibold text-text">
                  {movie.status}
                </p>
              </div>
              {movie.spoken_languages.length > 0 && (
                <div className="rounded-lg bg-surface p-4">
                  <p className="text-xs text-text-secondary">Language</p>
                  <p className="mt-1 font-semibold text-text">
                    {movie.spoken_languages
                      .map((l) => l.english_name)
                      .join(", ")}
                  </p>
                </div>
              )}
              {movie.production_countries.length > 0 && (
                <div className="rounded-lg bg-surface p-4">
                  <p className="text-xs text-text-secondary">Country</p>
                  <p className="mt-1 font-semibold text-text">
                    {movie.production_countries
                      .map((c) => c.name)
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>
          </section>
          </AnimatedSection>

          {/* ── Similar Movies ── */}
          {similar.results.length > 0 && (
            <SimilarMoviesSection movieId={movieId} initialMovies={similar.results} />
          )}

          {/* ── Reviews ── */}
          <div className="pt-10">
            <ErrorBoundary fallback={<p className="text-text-secondary py-8 text-center">Reviews are currently unavailable.</p>}>
              <AnimatedSection>
                <ReviewSection movieId={movieId} />
              </AnimatedSection>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    );
  }