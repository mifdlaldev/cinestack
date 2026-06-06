// ─────────────────────────────────────────────────────────────
// Single News Article API Route — GET by slug
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news_articles")
    .select(
      `
      id,
      title,
      slug,
      content,
      excerpt,
      cover_image,
      author_id,
      source,
      status,
      published_at,
      created_at,
      updated_at,
      author:users(name, avatar_url)
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data });
}
