import { NextRequest, NextResponse } from "next/server";
import { searchActors } from "@/lib/tmdb";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute
  const rateLimit = await applyRateLimit(request, RATE_LIMITS.search);
  if (rateLimit) return rateLimit;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = searchParams.get("page");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: { code: "MISSING_QUERY", message: "Search query is required" } },
        { status: 400 },
      );
    }

    const data = await searchActors(query.trim(), page ? Number(page) : undefined);

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search actors";
    return NextResponse.json(
      { error: { code: "SEARCH_ERROR", message } },
      { status: 500 },
    );
  }
}
