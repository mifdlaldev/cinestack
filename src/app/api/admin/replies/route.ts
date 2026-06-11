import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const supabase = await createClient();

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

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
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
      user:users(name, avatar_url, email)
    `,
      { count: "exact" },
    )
    .not("parent_id", "is", null);

  if (search) {
    const { data: matchingUsers } = await supabase
      .from("users")
      .select("id")
      .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      .limit(100);

    if (matchingUsers && matchingUsers.length > 0) {
      const userIds = matchingUsers.map((u) => u.id);
      query = query.in("user_id", userIds);
    } else {
      const movieId = parseInt(search, 10);
      if (!isNaN(movieId)) {
        query = query.eq("movie_id", movieId);
      } else {
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }

  const movieIds = [...new Set((data ?? []).map((r) => r.movie_id))];
  const movieTitles: Record<number, string> = {};

  if (movieIds.length > 0) {
    const { data: cachedMovies } = await supabase
      .from("movie_cache")
      .select("tmdb_id, title")
      .in("tmdb_id", movieIds);

    if (cachedMovies) {
      for (const m of cachedMovies) {
        movieTitles[m.tmdb_id] = m.title;
      }
    }
  }

  const enrichedData = (data ?? []).map((review) => ({
    ...review,
    movie_title: movieTitles[review.movie_id] ?? `Movie #${review.movie_id}`,
  }));

  return NextResponse.json({
    data: enrichedData,
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
