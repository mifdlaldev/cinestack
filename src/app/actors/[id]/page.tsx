import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getPersonDetail,
  getPersonMovieCredits,
  getProfileUrl,
  getImageUrl,
  TmdbApiError,
} from "@/lib/tmdb";
import { ShareButton } from "@/components/ui/ShareButton";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Star } from "lucide-react";
import type {
  TmdbPersonDetail,
  TmdbPersonCredits,
  TmdbPersonCastMember,
} from "@/types/tmdb";

export const revalidate = 7200;

// ─── Dynamic Metadata ───────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const personId = parseInt(id, 10);
    if (isNaN(personId)) return { title: "Actor Not Found" };

    const person = await getPersonDetail(personId);
    const profileUrl = getProfileUrl(person.profile_path, "h632");

    return {
      title: `${person.name} — Actor`,
      description:
        person.biography?.slice(0, 160) ??
        `Profile and filmography for ${person.name}`,
      openGraph: {
        title: person.name,
        description: person.biography?.slice(0, 160) ?? undefined,
        images: profileUrl ? [{ url: profileUrl, width: 500, height: 750 }] : [],
        type: "profile",
      },
    };
  } catch {
    return { title: "Actor Not Found" };
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(dateString: string | null): string {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateAge(birthday: string | null, deathday: string | null): string {
  if (!birthday) return "";
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  const age = Math.floor((end.getTime() - birth.getTime()) / (365.25 * 86400000));
  return deathday ? `${age} (at death)` : `${age} years old`;
}

function getFirstSentence(text: string): string {
  // Match the first sentence ending with . ! or ? followed by space or end of string
  const match = text.match(/^.*?[.!?](?:\s|$)/);
  if (match) return match[0].trim();
  // Fallback: take first 150 chars
  return text.slice(0, 150).trim() + ".";
}

function getGenderLabel(gender: number): string {
  switch (gender) {
    case 1: return "Female";
    case 2: return "Male";
    default: return "Non-binary";
  }
}

// ─── Filmography Card ───────────────────────────────────────

function FilmCard({ credit }: { credit: TmdbPersonCastMember }) {
  const posterUrl = getImageUrl(credit.poster_path, "w342");
  const year = credit.release_date
    ? new Date(credit.release_date).getFullYear()
    : null;
    const rating = credit.vote_average > 0 ? credit.vote_average.toFixed(1) : null;

  return (
    <Link
      href={`/movies/${credit.id}`}
      className="group flex overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(245,197,24,0.08)]"
    >
      <div className="relative h-24 w-16 flex-shrink-0 sm:h-28 sm:w-20">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={credit.title}
            fill
            sizes="80px"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-hover">
            <span className="text-2xl font-display text-text-secondary/30">?</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1 p-4">
        <h4 className="line-clamp-1 text-sm font-semibold text-text transition-colors group-hover:text-accent">
          {credit.title}
        </h4>
        <p className="line-clamp-1 text-xs text-text-secondary">
          {credit.character}
        </p>
        <div className="flex items-center gap-3 text-xs text-text-secondary/70">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main Content ───────────────────────────────────────────

async function ActorContent({ personId }: { personId: number }) {
  let person: TmdbPersonDetail;
  let credits: TmdbPersonCredits;

  try {
    const results = await Promise.all([
      getPersonDetail(personId),
      getPersonMovieCredits(personId),
    ]);
    person = results[0];
    credits = results[1];
  } catch (error) {
    if (error instanceof TmdbApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  const profileUrl = getProfileUrl(person.profile_path, "h632");
  const age = calculateAge(person.birthday, person.deathday);

  // Sort cast credits by popularity descending, deduplicate by movie id
  const filmography = credits.cast
    .filter(
      (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
    )
    .sort((a, b) => b.popularity - a.popularity);

  const topCredits = filmography.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-10 lg:px-8">
      {/* ── Hero ── */}
      <AnimatedSection>
        <section className="relative mb-14 overflow-hidden rounded-2xl">
          {/* Cinematic spotlight background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-bg" />
          <div className="absolute left-1/2 top-0 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/8 via-accent/4 to-transparent blur-[120px]" />
          <div className="absolute left-1/2 top-20 h-32 w-32 -translate-x-1/2 rounded-full bg-accent/10 blur-[60px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.03)_0%,transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:gap-12 p-6 md:p-10">
          {/* Profile photo */}
          <div className="mx-auto w-48 flex-shrink-0 md:mx-0 md:w-64">
            <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-[0_0_30px_rgba(245,197,24,0.12)]">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={person.name}
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
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl tracking-tight text-text md:text-4xl lg:text-5xl">
                {person.name}
              </h1>
              <ShareButton
                title={person.name}
                text={`Check out ${person.name} on CineStack`}
                variant="icon"
              />
            </div>

            {/* Bio */}
            {person.biography && (
            <div className="w-full text-base leading-relaxed text-text/90 text-justify">
                <p>{getFirstSentence(person.biography)}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {person.birthday && (
                <div className="rounded-lg glass-card p-3">
                  <p className="text-xs text-text-secondary">Born</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">
                    {formatDate(person.birthday)}
                  </p>
                </div>
              )}
              {age && (
                <div className="rounded-lg glass-card p-3">
                  <p className="text-xs text-text-secondary">Age</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">
                    {age}
                  </p>
                </div>
              )}
              {person.place_of_birth && (
                <div className="rounded-lg glass-card p-3">
                  <p className="text-xs text-text-secondary">Place of Birth</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">
                    {person.place_of_birth}
                  </p>
                </div>
              )}
              <div className="rounded-lg glass-card p-3">
                <p className="text-xs text-text-secondary">Known for</p>
                <p className="mt-0.5 text-sm font-semibold text-text">
                  {person.known_for_department}
                </p>
              </div>
              <div className="rounded-lg glass-card p-3">
                <p className="text-xs text-text-secondary">Gender</p>
                <p className="mt-0.5 text-sm font-semibold text-text">
                  {getGenderLabel(person.gender)}
                </p>
              </div>
              {credits.cast.length > 0 && (
                <div className="rounded-lg glass-card p-3">
                  <p className="text-xs text-text-secondary">Filmography</p>
                  <p className="mt-0.5 text-sm font-semibold text-text">
                    {credits.cast.length} movies
                  </p>
                </div>
              )}
            </div>

            {/* Top credits */}
            {topCredits.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Known for
                </p>
                <div className="flex flex-wrap gap-2">
                  {topCredits.map((c) => (
                    <Link
                      key={`${c.id}-${c.character}`}
                      href={`/movies/${c.id}`}
                      className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {c.title}
                      {c.character ? ` (${c.character})` : ""}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Full Biography ── */}
      {person.biography && person.biography.length > 150 && (
        <AnimatedSection>
          <section className="mb-14">
            <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
              Biography
            </h2>
            <div className="w-full text-base leading-relaxed text-text/90">
              {person.biography.split(/\n\n+/).map((paragraph, i) => (
                <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ── Filmography ── */}
      {filmography.length > 0 && (
        <AnimatedSection>
          <section className="mb-14">
            <h2 className="mb-6 font-display text-2xl tracking-tight text-text">
              Filmography
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filmography.map((credit) => (
                <FilmCard key={`${credit.id}-${credit.credit_id}`} credit={credit} />
              ))}
            </div>
          </section>
        </AnimatedSection>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personId = parseInt(id, 10);

  if (isNaN(personId)) {
    notFound();
  }

  return <ActorContent personId={personId} />;
}
