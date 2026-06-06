// ─────────────────────────────────────────────────────────────
// Watchlist Item API Route — DELETE (remove)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
            // Can be ignored in Route Handlers
          }
        },
      },
    },
  );
}

/**
 * DELETE /api/watchlist/[id]
 * Remove a movie from the authenticated user's watchlist.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Movie ID must be a positive integer" } },
      { status: 400 },
    );
  }

  const { error, count } = await supabase
    .from("watchlists")
    .delete({ count: "exact" })
    .eq("user_id", user.id)
    .eq("movie_id", movieId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to remove movie from watchlist" } },
      { status: 500 },
    );
  }

  if (count === 0) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Movie not in watchlist" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: { movieId } });
}
