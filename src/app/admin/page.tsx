// ─────────────────────────────────────────────────────────────
// Admin Dashboard — Stats overview, recent activity, quick actions
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Film,
  MessageSquare,
  FileText,
  Plus,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { getImageUrl, getMovieDetail } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}

function StatCard({ icon, label, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:bg-surface-hover active:scale-[0.98]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </Link>
  );
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string | null): string {
  if (!name) return "bg-surface-hover";
  const colors = [
    "bg-accent/20",
    "bg-blue-500/20",
    "bg-emerald-500/20",
    "bg-purple-500/20",
    "bg-rose-500/20",
    "bg-amber-500/20",
    "bg-cyan-500/20",
    "bg-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < (name ?? "").length; i++) {
    hash = (name ?? "").charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

async function DashboardContent() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalReviews },
    { count: totalMovies },
    { count: totalArticles },
    recentUsersResult,
    recentReviewsResult,
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("movie_cache").select("*", { count: "exact", head: true }),
    supabase
      .from("news_articles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("users")
      .select("id, email, name, avatar_url, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        content,
        created_at,
        movie_id,
        user:users(name, avatar_url)
      `,
      )
      .is("parent_id", null)
      .not("rating", "is", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Fetch movie titles for recent reviews
  const movieIds = [
    ...new Set((recentReviewsResult.data ?? []).map((r) => r.movie_id)),
  ];
  const { data: cachedMovies } = movieIds.length
    ? await supabase
        .from("movie_cache")
        .select("tmdb_id, title, data")
        .in("tmdb_id", movieIds)
    : { data: [] };

  const cachedIds = new Set((cachedMovies ?? []).map((m) => m.tmdb_id));
  const missingIds = movieIds.filter((id) => !cachedIds.has(id));

  // Fetch missing movies from TMDB API as fallback
  const tmdbResults = missingIds.length
    ? await Promise.allSettled(
        missingIds.map((id) => getMovieDetail(id)),
      )
    : [];

  const movieInfo: Record<number, { title: string; posterUrl: string | null }> = {};
  if (cachedMovies) {
    for (const m of cachedMovies) {
      const posterPath = (m.data as { poster_path?: string | null } | null)?.poster_path ?? null;
      movieInfo[m.tmdb_id] = {
        title: m.title,
        posterUrl: posterPath ? getImageUrl(posterPath, "w92") : null,
      };
    }
  }
  for (const result of tmdbResults) {
    if (result.status === "fulfilled") {
      const movie = result.value;
      movieInfo[movie.id] = {
        title: movie.title,
        posterUrl: movie.poster_path
          ? getImageUrl(movie.poster_path, "w92")
          : null,
      };
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of your CineStack platform
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={totalUsers ?? 0}
          href="/admin/users"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Total Reviews"
          value={totalReviews ?? 0}
          href="/admin/reviews"
        />
        <StatCard
          icon={<Film className="h-5 w-5" />}
          label="Cached Movies"
          value={totalMovies ?? 0}
          href="/admin/movies"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Articles"
          value={totalArticles ?? 0}
          href="/admin/news"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 font-display text-lg tracking-tight text-text">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/movies"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Sync Movie
          </Link>
          <Link
            href="/admin/news"
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface-hover active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Write Article
          </Link>
        </div>
      </div>

      {/* Two-column: recent users + recent reviews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <section className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-base tracking-tight text-text">
              Recent Users
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(recentUsersResult.data ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-text-secondary">
                No users yet
              </p>
            ) : (
              (recentUsersResult.data ?? []).map(
                (u: {
                  id: string;
                  name: string | null;
                  email: string;
                  avatar_url: string | null;
                  role: string;
                  created_at: string;
                }) => (
                  <div
                      key={u.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      {u.avatar_url ? (
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={u.avatar_url}
                            alt={u.name ?? "User"}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                            getAvatarColor(u.name)
                          }
                          aria-hidden="true"
                        >
                          {getInitials(u.name)}
                        </div>
                      )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        {u.name ?? "Unnamed"}
                      </p>
                      <p className="truncate text-xs text-text-secondary">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.role === "admin" && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          Admin
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">
                        {formatRelativeTime(u.created_at)}
                      </span>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        {/* Recent Reviews */}
        <section className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-base tracking-tight text-text">
              Recent Reviews
            </h2>
            <Link
              href="/admin/reviews"
              className="text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(recentReviewsResult.data ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-text-secondary">
                No reviews yet
              </p>
            ) : (
                  (recentReviewsResult.data ?? []).map(
                    (r: Record<string, unknown>) => {
                      const userObj = Array.isArray(r.user)
                        ? (r.user as Array<{ name: string | null; avatar_url: string | null }>)[0]
                        : (r.user as { name: string | null; avatar_url: string | null } | null);
                      const movie = movieInfo[r.movie_id as number];
                      return (
                        <Link
                          key={r.id as string}
                          href={`/admin/reviews`}
                          className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-hover"
                        >
                          <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-surface">
                            {movie?.posterUrl ? (
                              <Image
                                src={movie.posterUrl}
                                alt={movie.title}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Film className="h-4 w-4 text-text-secondary/30" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text">
                              {userObj?.name ?? "Anonymous"}{" "}
                              <span className="font-normal text-text-secondary">
                                reviewed
                              </span>
                            </p>
                            <p className="truncate text-xs text-text-secondary">
                              {movie?.title ?? `Movie #${r.movie_id}`}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary/70">
                              &ldquo;{r.content as string}&rdquo;
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {(() => {
                              const rt = r.rating as number | undefined;
                              return rt && rt > 0 ? (
                                <span className="flex items-center gap-0.5 text-xs font-medium text-accent">
                                  <Star className="h-3 w-3 fill-accent" />
                                  {rt > 5 ? Math.round(rt / 2) : rt}
                                </span>
                              ) : null;
                            })()}
                            <span className="text-xs text-text-secondary">
                              {formatRelativeTime(r.created_at as string)}
                            </span>
                          </div>
                        </Link>
                      );
                    },
                  )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <DashboardContent />;
}
