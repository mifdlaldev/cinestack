// ─────────────────────────────────────────────────────────────
// Admin Movies API — GET cached movies list (paginated)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

const PAGE_SIZE = 18;

type AuthResult =
  | { ok: false; error: string; status: number }
  | { ok: true; userId: string };

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, userId: user.id };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const auth = await verifyAdmin(supabase);
  if (!auth.ok) {
    return NextResponse.json({ error: { code: auth.error.toUpperCase(), message: auth.error } }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);

  // Return all cached TMDB IDs (for sync status checking)
  if (searchParams.get("all_ids") === "true") {
    const { data: ids } = await supabase
      .from("movie_cache")
      .select("tmdb_id");
    return NextResponse.json({ ids: (ids ?? []).map((r) => r.tmdb_id) });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("movie_cache")
    .select("*", { count: "exact" })
    .order("cached_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const auth = await verifyAdmin(supabase);
  if (!auth.ok) {
    return NextResponse.json({ error: { code: auth.error.toUpperCase(), message: auth.error } }, { status: auth.status });
  }

  const { tmdbId } = await request.json().catch(() => ({}));

  if (!tmdbId || typeof tmdbId !== "number") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "tmdbId (number) is required" } },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("movie_cache")
    .delete()
    .eq("tmdb_id", tmdbId);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { success: true } });
}
