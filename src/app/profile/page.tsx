import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import { ProfileContent } from "@/components/ui/ProfileContent";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile",
};

export const revalidate = 0;

async function ProfilePageContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

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

  return (
    <ProfileContent
      user={user}
      profile={profile}
      watchlistCount={watchlistCount ?? 0}
      reviewCount={reviewCount ?? 0}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-20 pb-12 md:px-6 md:pt-24 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:text-left">
        <div className="h-20 w-20 animate-pulse rounded-full bg-surface sm:h-24 sm:w-24" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-surface" />
          <div className="h-5 w-64 animate-pulse rounded bg-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        </div>
        <div className="hidden h-10 w-24 animate-pulse rounded-full bg-surface sm:block" />
      </div>
      <div className="mb-12 grid grid-cols-2 gap-4">
        <div className="animate-pulse rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-surface" />
            <div className="space-y-2">
              <div className="h-7 w-16 rounded bg-surface" />
              <div className="h-3 w-20 rounded bg-surface" />
            </div>
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-surface" />
            <div className="space-y-2">
              <div className="h-7 w-16 rounded bg-surface" />
              <div className="h-3 w-20 rounded bg-surface" />
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist skeleton */}
      <div className="mb-12">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-surface" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[140px] flex-shrink-0 sm:w-[160px]">
              <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface" />
              <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface" />
              <div className="mt-1 h-2 w-1/2 animate-pulse rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>

      {/* Reviews skeleton */}
      <div>
        <div className="mb-4 h-6 w-28 animate-pulse rounded bg-surface" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-3">
              <div className="h-[80px] w-[54px] flex-shrink-0 animate-pulse rounded-lg bg-surface-hover sm:h-[100px] sm:w-[67px]" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}
