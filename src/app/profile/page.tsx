// ─────────────────────────────────────────────────────────────
// Profile Page — Protected, shows user info and stats
// ─────────────────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Star, LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { signOut } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Profile",
};

export const revalidate = 0; // Always fresh — user-specific data

// ─── Sign Out Server Action ──────────────────────────────────

function SignOutForm() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-error/40 hover:bg-surface-hover hover:text-error active:scale-[0.97]"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </form>
  );
}

// ─── Stat Card ───────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

// ─── Profile Content ─────────────────────────────────────────

async function ProfileContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Should never happen — middleware redirects if not authenticated
  if (!user) {
    return null;
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Count stats
  const [{ count: reviewCount }, { count: watchlistCount }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("watchlists")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const displayName =
    profile?.name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-6 md:py-16 lg:px-8">
      {/* Profile Header */}
      <div className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-accent/30 sm:h-24 sm:w-24">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface">
              <UserIcon className="h-10 w-10 text-text-secondary" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            {displayName}
          </h1>
          {user.email && (
            <p className="mt-1 text-text-secondary">{user.email}</p>
          )}
          <p className="mt-0.5 text-xs text-text-secondary">
            Joined{" "}
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <SignOutForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="In Watchlist"
          value={watchlistCount ?? 0}
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Reviews Written"
          value={reviewCount ?? 0}
        />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:text-left">
        <div className="h-20 w-20 animate-pulse rounded-full bg-surface sm:h-24 sm:w-24" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-surface" />
          <div className="h-5 w-64 animate-pulse rounded bg-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 animate-pulse rounded-xl bg-surface" />
        <div className="h-24 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
