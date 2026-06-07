// ─────────────────────────────────────────────────────────────
// Watch Providers API — Batch (multiple movies)
// GET /api/movies/providers/batch?movieIds=123,456,789
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getMovieWatchProviders } from "@/lib/tmdb";
import type { TmdbWatchProviders } from "@/types/tmdb";

export const revalidate = 3600; // ISR — 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawIds = searchParams.get("movieIds");

  if (!rawIds || rawIds.trim().length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_IDS",
          message: "movieIds query parameter is required (comma-separated)",
        },
      },
      { status: 400 },
    );
  }

  const ids = rawIds
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  if (ids.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_IDS",
          message: "No valid movie IDs provided",
        },
      },
      { status: 400 },
    );
  }

  const results: Record<number, TmdbWatchProviders | null> = {};
  let hasError = false;

  // Fetch providers for each movie in parallel (limited concurrency)
  const fetchPromises = ids.map(async (movieId) => {
    try {
      const data = await getMovieWatchProviders(movieId);
      results[movieId] = data;
    } catch {
      results[movieId] = null;
      hasError = true;
    }
  });

  await Promise.all(fetchPromises);

  const status = hasError ? 207 : 200;
  return NextResponse.json({ data: results }, { status });
}
