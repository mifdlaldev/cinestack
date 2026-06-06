import { NextRequest, NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";

export const revalidate = 3600; // ISR — 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const genreId = searchParams.get("genreId");
    const year = searchParams.get("year");
    const sortBy = searchParams.get("sortBy");
    const page = searchParams.get("page");

    const data = await discoverMovies({
      genreId: genreId ? Number(genreId) : undefined,
      year: year ? Number(year) : undefined,
      sortBy: sortBy ?? undefined,
      page: page ? Number(page) : undefined,
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
