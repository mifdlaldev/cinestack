"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, LogOut, Calendar, Mail, Film, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { getImageUrl } from "@/lib/tmdb";
import { useRouter } from "next/navigation";
import type { TmdbMovie } from "@/types/tmdb";

interface Review {
  id: string;
  movie_id: number;
  rating: number;
  content: string;
  created_at: string;
  movieTitle?: string;
  posterPath?: string;
}

function MovieCardSmall({ movie }: { movie: TmdbMovie }) {
  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average.toFixed(1);

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group w-full"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="140px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-8 w-8 text-text-secondary/30" />
          </div>
        )}
        <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 fill-accent" />
          {rating}
        </div>
      </div>
      <p className="mt-1.5 line-clamp-1 text-xs font-medium text-text transition-colors group-hover:text-accent">
        {movie.title}
      </p>
      {year && <p className="text-[10px] text-text-secondary">{year}</p>}
    </Link>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(review.rating / 2));
  const posterUrl = review.posterPath ? getImageUrl(review.posterPath, "w185") : null;

  return (
    <Link
      href={`/movies/${review.movie_id}`}
      className="group flex gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:border-accent/20"
    >
      <div className="relative h-[80px] w-[54px] flex-shrink-0 overflow-hidden rounded-lg bg-surface sm:h-[100px] sm:w-[67px]">
        {posterUrl ? (
          <Image src={posterUrl} alt={review.movieTitle ?? ""} fill sizes="67px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-5 w-5 text-text-secondary/30" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
            {review.movieTitle ?? `Movie #${review.movie_id}`}
          </h3>
          <div className="flex shrink-0 gap-0.5">
            {stars.map((filled, i) => (
              <Star key={i} className={`h-3 w-3 ${filled ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {review.content || "No written review."}
        </p>
        <p className="mt-1.5 text-[10px] text-text-secondary/60">
          {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </Link>
  );
}

export function ProfileContent({
  user,
  profile,
  watchlistCount,
  reviewCount,
}: {
  user: any;
  profile: any;
  watchlistCount: number;
  reviewCount: number;
}) {
  const router = useRouter();
  const [watchlistMovies, setWatchlistMovies] = useState<TmdbMovie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch watchlist IDs
        const wlRes = await fetch("/api/watchlist");
        const wlJson = await wlRes.json();
        const ids: number[] = wlJson.data ?? [];

        // Fetch movie details for watchlist
        const movies = await Promise.all(
          ids.slice(0, 20).map(async (id: number) => {
            try {
              const res = await fetch(`/api/movie?id=${id}`);
              if (!res.ok) return null;
              const json = await res.json();
              return json.movie ?? null;
            } catch {
              return null;
            }
          }),
        );
        setWatchlistMovies(movies.filter(Boolean));

        // Fetch reviews from our API
        const revRes = await fetch(`/api/reviews/user`);
        if (revRes.ok) {
          const revJson = await revRes.json();
          const rawReviews = revJson.data ?? [];

          // Fetch movie details for each review
          const enriched = await Promise.all(
            rawReviews.map(async (review: Review) => {
              try {
                const res = await fetch(`/api/movie?id=${review.movie_id}`);
                if (res.ok) {
                  const json = await res.json();
                  const movie = json.movie;
                  if (movie?.title) {
                    return { ...review, movieTitle: movie.title, posterPath: movie.poster_path };
                  }
                }
              } catch {}
              return review;
            }),
          );
          setReviews(enriched);
        }
      } catch (e) {
        console.error("Failed to load profile data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayName =
    profile?.name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColors = [
    "bg-accent/20", "bg-blue-500/20", "bg-emerald-500/20", "bg-purple-500/20",
    "bg-rose-500/20", "bg-amber-500/20", "bg-cyan-500/20", "bg-pink-500/20",
  ];
  const textColors = [
    "text-accent", "text-blue-400", "text-emerald-400", "text-purple-400",
    "text-rose-400", "text-amber-400", "text-cyan-400", "text-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = avatarColors[Math.abs(hash) % avatarColors.length];
  const textColor = textColors[Math.abs(hash) % textColors.length];

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-20 pb-12 md:px-6 md:pt-24 lg:px-8">
      {/* ─── Profile Header ─── */}
      <div className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24 ${avatarColor}`}
        >
          <span className={`text-lg font-bold sm:text-xl ${textColor}`}>
            {initials || "?"}
          </span>
        </div>

        <div className="flex-1">
          <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            {displayName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.refresh();
            router.push("/");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/70 backdrop-blur-[20px] px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:text-error active:scale-[0.97]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      {/* ─── Stats ─── */}
      <div className="mb-12 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{watchlistCount}</p>
              <p className="text-xs text-text-secondary">In Watchlist</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{reviewCount}</p>
              <p className="text-xs text-text-secondary">Reviews Written</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Watchlist ─── */}
      {watchlistMovies.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-text">My Watchlist</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {watchlistMovies.map((movie) => (
              <MovieCardSmall key={movie.id} movie={movie} />
            ))}
          </div>
          {watchlistMovies.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-text-secondary">
              No movies in your watchlist yet.
            </p>
          )}
        </section>
      )}

      {/* ─── Reviews ─── */}
      {reviews.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl text-text">My Reviews</h2>
          <div className="space-y-3">
            {reviews.slice(0, 10).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="space-y-4 py-12">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[140px] flex-shrink-0 sm:w-[160px]">
                <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
