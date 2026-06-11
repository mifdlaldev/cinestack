// ─────────────────────────────────────────────────────────────
// Admin Movie Sync API — POST sync movie from TMDB to cache
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getMovieDetail } from "@/lib/tmdb";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin role server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Forbidden" } },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const tmdbId = body.tmdbId;

  if (!tmdbId || typeof tmdbId !== "number") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "tmdbId (number) is required in request body" } },
      { status: 400 },
    );
  }

  try {
    // Fetch movie details from TMDB
    const movieDetail = await getMovieDetail(tmdbId);

    // Upsert into movie_cache
    const { error } = await supabase.from("movie_cache").upsert(
      {
        tmdb_id: tmdbId,
        title: movieDetail.title,
        data: movieDetail as unknown as Record<string, unknown>,
      },
      { onConflict: "tmdb_id" },
    );

    if (error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: { success: true, movie: { id: tmdbId, title: movieDetail.title } },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync movie";
    return NextResponse.json(
      { error: { code: "FETCH_ERROR", message } },
      { status: 502 },
    );
  }
}
