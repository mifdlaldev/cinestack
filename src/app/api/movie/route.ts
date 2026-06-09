import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");

  if (!idParam) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const movie = await getMovieDetail(id);
    return NextResponse.json({ movie });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
