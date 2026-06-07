// ─────────────────────────────────────────────────────────────
// Watch Providers API — Single movie
// GET /api/movies/providers/[id]
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  getMovieWatchProviders,
  TmdbApiError,
} from "@/lib/tmdb";

export const revalidate = 3600; // ISR — 1 hour

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    return NextResponse.json(
      { error: { code: "INVALID_ID", message: "Movie ID must be a number" } },
      { status: 400 },
    );
  }

  try {
    const data = await getMovieWatchProviders(movieId);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof TmdbApiError) {
      return NextResponse.json(
        {
          error: { code: error.code, message: error.message },
        },
        { status: error.statusCode ?? 502 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch watch providers",
        },
      },
      { status: 500 },
    );
  }
}
