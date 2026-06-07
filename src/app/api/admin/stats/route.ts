// ─────────────────────────────────────────────────────────────
// Admin Stats API — GET aggregate dashboard stats
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createClient();

  // Verify admin role server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, { status: 403 });
  }

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
        user:users(name, avatar_url),
        movie_id
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalReviews: totalReviews ?? 0,
    totalMovies: totalMovies ?? 0,
    totalArticles: totalArticles ?? 0,
    recentUsers: recentUsersResult.data ?? [],
    recentReviews: recentReviewsResult.data ?? [],
  });
}
