// ─────────────────────────────────────────────────────────────
// Watchlist API Route — GET (list) / POST (add)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase server client for use in Route Handlers.
 */
async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Can be ignored in Route Handlers — middleware refreshes sessions
          }
        },
      },
    },
  );
}

/**
 * GET /api/watchlist
 * Fetch all movie IDs in the authenticated user's watchlist.
 */
export async function GET() {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("watchlists")
    .select("movie_id, added_at")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch watchlist" } },
      { status: 500 },
    );
  }

  const movieIds = data.map((row) => row.movie_id);

  return NextResponse.json({ data: movieIds });
}

/**
 * POST /api/watchlist
 * Add a movie to the authenticated user's watchlist.
 * Body: { movieId: number }
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  let movieId: number;
  try {
    const body = await request.json();
    movieId = body.movieId;

    if (typeof movieId !== "number" || !Number.isInteger(movieId) || movieId <= 0) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "movieId must be a positive integer" } },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("watchlists").insert({
    user_id: user.id,
    movie_id: movieId,
  });

  if (error) {
    // Unique constraint violation — already in watchlist, treat as success
    if (error.code === "23505") {
      return NextResponse.json({ data: { movieId, alreadyExists: true } });
    }

    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to add movie to watchlist" } },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { data: { movieId } },
    { status: 201 },
  );
}
