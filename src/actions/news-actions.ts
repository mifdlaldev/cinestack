// ─────────────────────────────────────────────────────────────
// News Server Actions — Admin CRUD for articles
// ─────────────────────────────────────────────────────────────

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { NewsArticleRow } from "@/types/news";

// ─── Validation schemas ──────────────────────────────────────

const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  cover_image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

const updateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  cover_image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

// ─── Action result type ──────────────────────────────────────

export type NewsActionResult = {
  error?: string;
  data?: NewsArticleRow;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

// ─── Create article ──────────────────────────────────────────

export async function createArticle(
  formData: FormData,
): Promise<NewsActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin access required" };
  }

  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: formData.get("excerpt") as string,
    cover_image: formData.get("cover_image") as string,
    status: formData.get("status") as "draft" | "published",
  };

  // Auto-generate slug if not provided
  const slugInput =
    (formData.get("slug") as string) || slugify(rawData.title);
  rawData.title = rawData.title;

  const parsed = createArticleSchema.safeParse({
    ...rawData,
    slug: slugInput,
  });

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: firstError };
  }

  // Handle slug uniqueness
  const { count: slugConflict } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .eq("slug", parsed.data.slug)
    .is("deleted_at", null);

  const finalSlug =
    slugConflict && slugConflict > 0
      ? `${parsed.data.slug}-${Date.now()}`
      : parsed.data.slug;

  const publishedAt =
    parsed.data.status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("news_articles")
    .insert({
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      cover_image: parsed.data.cover_image || null,
      author_id: user.id,
      source: "manual",
      status: parsed.data.status,
      published_at: publishedAt,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/news");
  revalidatePath("/api/news");
  return { data };
}

// ─── Update article ──────────────────────────────────────────

export async function updateArticle(
  articleId: string,
  formData: FormData,
): Promise<NewsActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin access required" };
  }

  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: formData.get("excerpt") as string,
    cover_image: formData.get("cover_image") as string,
    status: formData.get("status") as "draft" | "published",
  };

  const slugInput =
    (formData.get("slug") as string) || slugify(rawData.title);

  const parsed = updateArticleSchema.safeParse({
    ...rawData,
    slug: slugInput,
  });

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: firstError };
  }

  // Get the existing article to check if published_at needs setting
  const { data: existing } = await supabase
    .from("news_articles")
    .select("published_at, status, slug")
    .eq("id", articleId)
    .single();

  if (!existing) {
    return { error: "Article not found" };
  }

  // If publishing for the first time, set published_at
  const publishedAt =
    parsed.data.status === "published" && !existing.published_at
      ? new Date().toISOString()
      : undefined;

  const { data, error } = await supabase
    .from("news_articles")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      cover_image: parsed.data.cover_image || null,
      status: parsed.data.status,
      ...(publishedAt ? { published_at: publishedAt } : {}),
    })
    .eq("id", articleId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/news");
  revalidatePath(`/news/${parsed.data.slug}`);
  revalidatePath("/api/news");
  return { data };
}

// ─── Delete article (soft delete) ────────────────────────────

export async function deleteArticle(
  articleId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin access required" };
  }

  // Soft delete
  const { error } = await supabase
    .from("news_articles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", articleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/news");
  revalidatePath("/api/news");
  return {};
}

// ─── Publish / unpublish article ─────────────────────────────

export async function toggleArticleStatus(
  articleId: string,
  newStatus: "draft" | "published",
): Promise<NewsActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Admin access required" };
  }

  const updateData: Partial<NewsArticleRow> = { status: newStatus };
  if (newStatus === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("news_articles")
    .update(updateData)
    .eq("id", articleId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/news");
  revalidatePath(`/news/${data.slug}`);
  revalidatePath("/api/news");
  return { data };
}
