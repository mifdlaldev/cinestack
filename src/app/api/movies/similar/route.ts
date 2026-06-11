import { NextRequest, NextResponse } from "next/server";
import { getSimilarMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const movieIdParam = searchParams.get("movieId");
  const pageParam = searchParams.get("page") ?? "1";

  if (!movieIdParam) {
    return NextResponse.json(
      { error: { code: "MISSING_PARAM", message: "movieId is required" } },
      { status: 400 },
    );
  }

  const movieId = parseInt(movieIdParam, 10);
  const page = parseInt(pageParam, 10);

  if (isNaN(movieId) || isNaN(page)) {
    return NextResponse.json(
      { error: { code: "INVALID_PARAM", message: "Invalid params" } },
      { status: 400 },
    );
  }

  try {
    const data = await getSimilarMovies(movieId, page);
    return NextResponse.json({ data: data.results, totalPages: data.total_pages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch similar movies";
    return NextResponse.json(
      { error: { code: "FETCH_ERROR", message } },
      { status: 500 },
    );
  }
}
