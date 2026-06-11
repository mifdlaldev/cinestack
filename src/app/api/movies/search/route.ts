// ─────────────────────────────────────────────────────────────
// Search Movies API Route
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { searchMovies, TmdbApiError } from "@/lib/tmdb";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  const rateLimit = await applyRateLimit(request, RATE_LIMITS.search);
  if (rateLimit) return rateLimit;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") ?? "1";

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: { code: "MISSING_QUERY", message: "Search query is required" } },
      { status: 400 },
    );
  }

  if (query.trim().length < 2) {
    return NextResponse.json(
      {
        error: {
          code: "QUERY_TOO_SHORT",
          message: "Search query must be at least 2 characters",
        },
      },
      { status: 400 },
    );
  }

  try {
    const data = await searchMovies(query.trim(), Math.max(1, parseInt(page, 10) || 1));
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof TmdbApiError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode ?? 502 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to search movies",
        },
      },
      { status: 500 },
    );
  }
}
