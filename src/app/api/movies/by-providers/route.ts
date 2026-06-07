import { NextRequest, NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";

export const revalidate = 3600; // ISR — 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const providerIdsRaw = searchParams.get("providerIds");
    const page = searchParams.get("page");

    if (!providerIdsRaw) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_PROVIDER_IDS",
            message: "providerIds query parameter is required",
          },
        },
        { status: 400 },
      );
    }

    const providerIds = providerIdsRaw
      .split(",")
      .map(Number)
      .filter((id) => !Number.isNaN(id));

    if (providerIds.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PROVIDER_IDS",
            message: "providerIds must contain valid numeric TMDB provider IDs",
          },
        },
        { status: 400 },
      );
    }

    const data = await discoverMovies({
      providerIds,
      page: page ? Number(page) : undefined,
      watchRegion: searchParams.get("watchRegion") ?? "US",
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch movies by providers";
    return NextResponse.json(
      { error: { code: "BY_PROVIDERS_FETCH_ERROR", message } },
      { status: 500 },
    );
  }
}
