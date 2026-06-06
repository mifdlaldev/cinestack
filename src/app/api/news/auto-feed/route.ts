// ─────────────────────────────────────────────────────────────
// Auto-Feed API — Creates news articles from TMDB trending data
//
// Idempotent: checks for existing articles by title to avoid
// duplicates. Callable via cron or manual trigger.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getTrending, getImageUrl } from "@/lib/tmdb";
import { isAdmin } from "@/lib/auth-helpers";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

export async function POST() {
  // Require admin or service key for security
  const isServiceKey =
    process.env.AUTO_FEED_SECRET &&
    process.env.AUTO_FEED_SECRET.length > 0;

  if (!isServiceKey && !(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClient();

  // Find an admin user to be the default author
  const { data: adminUser } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (!adminUser) {
    return NextResponse.json(
      { error: "No admin user found to author articles" },
      { status: 500 },
    );
  }

  try {
    const trending = await getTrending("week");
    const movies = trending.results.slice(0, 10);
    const created: string[] = [];
    const skipped: string[] = [];

    for (const movie of movies) {
      // Check if article with same title already exists (idempotency)
      const { count: existing } = await supabase
        .from("news_articles")
        .select("*", { count: "exact", head: true })
        .eq("title", movie.title)
        .is("deleted_at", null);

      if (existing && existing > 0) {
        skipped.push(movie.title);
        continue;
      }

      const slug = slugify(movie.title);
      const coverImage = getImageUrl(movie.backdrop_path, "w780");

      const { data } = await supabase
        .from("news_articles")
        .insert({
          title: movie.title,
          slug,
          content: movie.overview || `${movie.title} is trending this week on CineStack. Stay tuned for more updates.`,
          excerpt: movie.overview
            ? movie.overview.length > 200
              ? movie.overview.slice(0, 200) + "..."
              : movie.overview
            : null,
          cover_image: coverImage,
          author_id: adminUser.id,
          source: "tmdb_auto",
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id, title")
        .single();

      if (data) {
        created.push(data.title);
      }
    }

    return NextResponse.json({
      created: created.length,
      skipped: skipped.length,
      created_titles: created,
      skipped_titles: skipped,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Auto-feed failed",
      },
      { status: 500 },
    );
  }
}
