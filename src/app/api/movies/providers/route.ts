import { NextRequest, NextResponse } from "next/server";
import { getWatchProviderList } from "@/lib/tmdb";

export const revalidate = 86400; // ISR — once per day

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const watchRegion = searchParams.get("watchRegion") ?? "US";

    const providers = await getWatchProviderList(watchRegion);
    return NextResponse.json({ data: providers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch providers";
    return NextResponse.json(
      { error: { code: "PROVIDERS_FETCH_ERROR", message } },
      { status: 500 },
    );
  }
}
