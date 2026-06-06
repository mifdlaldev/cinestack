// ─────────────────────────────────────────────────────────────
// Admin Movie Search API — Search TMDB from admin panel
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin role server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const result = await searchMovies(query.trim(), page);
    return NextResponse.json(result.results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search TMDB";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
