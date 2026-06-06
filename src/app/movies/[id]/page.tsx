// ─────────────────────────────────────────────────────────────
// Movie Detail Page — Server Component with ISR
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieVideos,
  getMovieWatchProviders,
  getSimilarMovies,
  getImageUrl,
  getBackdropUrl,
  getProfileUrl,
  getLogoUrl,
  TmdbApiError,
} from "@/lib/tmdb";
import type {
  TmdbCastMember,
  TmdbMovie,
  TmdbWatchProvider,
  TmdbWatchProviders,
  TmdbMovieDetail,
  TmdbCredit,
  TmdbVideos,
  TmdbPaginatedResponse,
} from "@/types/tmdb";

// ─── ISR configuration ──────────────────────────────────────

export const revalidate = 3600;

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

// ─── Cast Card ──────────────────────────────────────────────

const PLACEHOLDER_PROFILE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231a1a24' width='200' height='300'/%3E%3Ccircle fill='%2324242e' cx='100' cy='90' r='40'/%3E%3Cpath fill='%2324242e' d='M30 260 Q100 170 170 260'/%3E%3C/svg%3E";

function CastCard({ member }: { member: TmdbCastMember }) {
  const profileUrl = getProfileUrl(member.profile_path, "w185");

  return (
    <div className="flex w-32 flex-shrink-0 flex-col items-center text-center sm:w-36">
      <div className="mb-2 h-32 w-32 overflow-hidden rounded-full border-2 border-border sm:h-36 sm:w-36">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={member.name}
            width={144}
            height={144}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-surface-hover"
            style={{
              backgroundImage: `url("${PLACEHOLDER_PROFILE}")`,
              backgroundSize: "cover",
            }}
          />
        )}
      </div>
      <p className="line-clamp-1 text-sm font-semibold text-text">
        {member.name}
      </p>
      <p className="line-clamp-1 text-xs text-text-secondary">
        {member.character}
      </p>
    </div>
  );
}

// ─── Watch Provider Row ─────────────────────────────────────

function WatchProviderRow({
  label,
  providers,
}: {
  label: string;
  providers: TmdbWatchProvider[];
}) {
  if (providers.length === 0) return null;

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <div
            key={p.provider_id}
            className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2"
            title={p.provider_name}
          >
            {p.logo_path ? (
              <Image
                src={getLogoUrl(p.logo_path, "w92") ?? ""}
                alt={p.provider_name}
                width={24}
                height={24}
                className="h-6 w-6 rounded object-contain"
              />
            ) : null}
            <span className="text-xs text-text-secondary">
              {p.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Similar Movie Card ─────────────────────────────────────

function SimilarMovieCard({ movie }: { movie: TmdbMovie }) {
  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const rating = movie.vote_average.toFixed(1);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-alt">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl text-text-secondary/20">
              ?
            </span>
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-bg/80 px-2 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
          <span className="text-accent">★</span>
          {rating}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-text transition-colors group-hover:text-accent">
          {movie.title}
        </h3>
        {year && <p className="text-xs text-text-secondary">{year}</p>}
      </div>
    </Link>
  );
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

  // ── Extract the first YouTube trailer ──
  const trailer = videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube" && v.official,
  ) ?? videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube",
  );

  // ── Cast sorted by order, top 20 ──
  const cast = credits.cast
    .filter((c) => c.character)
    .slice(0, 20);

  // ── Watch providers: prefer US, fall back to first available ──
  const countryCodes = Object.keys(watchProviders.results);
  const countryKey = countryCodes.includes("US")
    ? "US"
    : countryCodes[0] ?? null;
  const providers = countryKey
    ? watchProviders.results[countryKey]
    : null;

  // ── Backdrop & poster ──
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "original");
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <div>
        {/* ── Hero Section ── */}
        <section className="relative min-h-[60dvh] md:min-h-[70dvh]">
          {/* Backdrop */}
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
          <div className="relative mx-auto flex h-full min-h-[60dvh] max-w-[1400px] flex-col items-start justify-end gap-6 px-4 pb-10 pt-24 md:min-h-[70dvh] md:flex-row md:items-end md:gap-10 md:px-6 md:pb-16 lg:px-8">
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
                <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5">
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
                      className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

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
            <section className="mb-14">
              <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
                Cast
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {cast.map((member) => (
                  <CastCard key={member.id} member={member} />
                ))}
              </div>
            </section>
          )}

          {/* ── Trailer Section ── */}
          {trailer && (
            <section className="mb-14">
              <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
                Trailer
              </h2>
              <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </section>
          )}

          {/* ── Watch Providers ── */}
          {providers && (
            <section className="mb-14">
              <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
                Where to Watch
              </h2>
              <div className="flex flex-col gap-4">
                {providers.flatrate && (
                  <WatchProviderRow
                    label="Stream"
                    providers={providers.flatrate}
                  />
                )}
                {providers.rent && (
                  <WatchProviderRow
                    label="Rent"
                    providers={providers.rent}
                  />
                )}
                {providers.buy && (
                  <WatchProviderRow
                    label="Buy"
                    providers={providers.buy}
                  />
                )}
              </div>
              {!providers.flatrate && !providers.rent && !providers.buy && (
                <p className="text-sm text-text-secondary">
                  No streaming information available for this region.
                </p>
              )}
            </section>
          )}

          {/* ── Movie Details ── */}
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

          {/* ── Similar Movies ── */}
          {similar.results.length > 0 && (
            <section>
              <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
                Similar Movies
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {similar.results.slice(0, 12).map((sMovie) => (
                  <SimilarMovieCard key={sMovie.id} movie={sMovie} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }