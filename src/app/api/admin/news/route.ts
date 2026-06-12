// ─────────────────────────────────────────────────────────────
// Admin News API — GET paginated articles, POST create article
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("news_articles")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch author names
  const authorIds = [...new Set((data ?? []).map((a) => a.author_id).filter(Boolean))];
  const authorNames: Record<string, string> = {};

  if (authorIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", authorIds);

    if (users) {
      for (const u of users) {
        authorNames[u.id] = u.name ?? "Unknown";
      }
    }
  }

  const enriched = (data ?? []).map((article) => ({
    ...article,
    author_name: authorNames[article.author_id] ?? "Unknown",
  }));

  return NextResponse.json({
    data: enriched,
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, slug, content, excerpt, cover_image, status } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "title, slug, and content are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc("admin_insert_article", {
    _title: title,
    _slug: slug,
    _content: content,
    _excerpt: excerpt ?? null,
    _cover_image: cover_image ?? null,
    _status: status ?? "draft",
  });

  if (error) {
    if (error.message?.includes("already exists")) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
