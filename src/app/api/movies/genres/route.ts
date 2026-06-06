import { NextResponse } from "next/server";
import { getMovieGenres } from "@/lib/tmdb";

export const revalidate = 86400; // ISR — once per day, genres rarely change

export async function GET() {
  try {
    const genres = await getMovieGenres();
    return NextResponse.json({ data: genres });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch genres";
    return NextResponse.json(
      { error: { code: "GENRES_FETCH_ERROR", message } },
      { status: 500 },
    );
  }
}
