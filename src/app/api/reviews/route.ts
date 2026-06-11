// ─────────────────────────────────────────────────────────────
// Reviews API Route — GET (list reviews for a movie)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const movieIdParam = searchParams.get("movieId");
  const pageParam = searchParams.get("page");

  if (!movieIdParam) {
    return NextResponse.json(
      { error: { code: "MISSING_PARAM", message: "movieId query parameter is required" } },
      { status: 400 },
    );
  }

  const movieId = parseInt(movieIdParam, 10);
  if (isNaN(movieId)) {
    return NextResponse.json(
      { error: { code: "INVALID_PARAM", message: "Invalid movieId" } },
      { status: 400 },
    );
  }

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("reviews")
    .select(
      `
      id,
      user_id,
      movie_id,
      rating,
      content,
      created_at,
      updated_at,
      parent_id,
      user:users(name, avatar_url)
    `,
      { count: "exact" },
    )
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }

  return NextResponse.json({
    data,
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
