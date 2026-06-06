// ─────────────────────────────────────────────────────────────
// Admin Dashboard — Stats overview, recent activity, quick actions
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
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
        .select("tmdb_id, title")
        .in("tmdb_id", movieIds)
    : { data: [] };

  const movieTitles: Record<number, string> = {};
  if (cachedMovies) {
    for (const m of cachedMovies) {
      movieTitles[m.tmdb_id] = m.title;
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/movies"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Sync Movie
          </Link>
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface-hover active:scale-[0.97]"
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
                    <div
                      className={
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                        getAvatarColor(u.name)
                      }
                      aria-hidden="true"
                    >
                      {getInitials(u.name)}
                    </div>
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
                  return (
                    <div
                      key={r.id as string}
                      className="flex items-start gap-3 px-5 py-3"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Star className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text">
                          {userObj?.name ?? "Anonymous"}{" "}
                          <span className="font-normal text-text-secondary">
                            rated {movieTitles[r.movie_id as number] ?? `#${r.movie_id}`}{" "}
                            <span className="text-accent">{r.rating as number}/10</span>
                          </span>
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                          {r.content as string}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-text-secondary">
                        {formatRelativeTime(r.created_at as string)}
                      </span>
                    </div>
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
