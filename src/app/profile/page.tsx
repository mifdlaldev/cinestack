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
      </div>
      <div className="mb-12 grid grid-cols-2 gap-4">
        <div className="h-20 animate-pulse rounded-xl bg-surface" />
        <div className="h-20 animate-pulse rounded-xl bg-surface" />
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
