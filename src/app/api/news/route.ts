// ─────────────────────────────────────────────────────────────
// News API Route — GET (list published), POST (admin create)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth-helpers";

const PAGE_SIZE = 10;

const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  cover_image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("news_articles")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      cover_image,
      author_id,
      source,
      status,
      published_at,
      created_at,
      author:users(name, avatar_url)
    `,
      { count: "exact" },
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const slug = slugify(parsed.data.title);

  // Check slug uniqueness — append suffix if needed
  const { count: slugConflict } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .eq("slug", slug);

  const finalSlug =
    slugConflict && slugConflict > 0
      ? `${slug}-${Date.now()}`
      : slug;

  const publishedAt =
    parsed.data.status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("news_articles")
    .insert({
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt ?? null,
      cover_image: parsed.data.cover_image || null,
      author_id: user.id,
      source: "manual",
      status: parsed.data.status,
      published_at: publishedAt,
    })
    .select("id, title, slug, status, published_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
