import { NextRequest, NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const rateLimit = await applyRateLimit(request, RATE_LIMITS.tmdb);
  if (rateLimit) return rateLimit;

  try {
    const { searchParams } = new URL(request.url);

    const genreId = searchParams.get("genreId");
    const year = searchParams.get("year");
    const sortBy = searchParams.get("sortBy");
    const page = searchParams.get("page");
    const providerIdsRaw = searchParams.get("providerIds");
    const watchRegion = searchParams.get("watchRegion");

    const providerIds = providerIdsRaw
      ? providerIdsRaw
          .split(",")
          .map(Number)
          .filter((id) => !Number.isNaN(id))
      : undefined;

    const data = await discoverMovies({
      genreId: genreId ? Number(genreId) : undefined,
      year: year ? Number(year) : undefined,
      sortBy: sortBy ?? undefined,
      page: page ? Number(page) : undefined,
      providerIds: providerIds && providerIds.length > 0 ? providerIds : undefined,
      watchRegion: watchRegion ?? undefined,
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to discover movies";
    return NextResponse.json(
      { error: { code: "DISCOVER_FETCH_ERROR", message } },
      { status: 500 },
    );
  }
}
