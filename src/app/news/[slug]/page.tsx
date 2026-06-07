// ─────────────────────────────────────────────────────────────
// News Article Detail Page — Full article with ISR
// ─────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, User } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { createClient } from "@/lib/supabase";
import { normalizeAuthor } from "@/types/news";
import { ShareButton } from "@/components/ui/ShareButton";

export const revalidate = 7200;

// ─── Generate metadata ───────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const supabase = await createClient();

  const { data } = await supabase
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

  if (!data) return null;

  // Normalize author from possible array
  return {
    ...data,
    author: normalizeAuthor(data.author),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const authorName = article.author && "name" in article.author ? (article.author as { name: string | null }).name : null;

  return {
    title: article.title,
    description: article.excerpt ?? `Read about ${article.title} on CineStack.`,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      authors: authorName ? [authorName] : undefined,
      images: article.cover_image
        ? [{ url: article.cover_image }]
        : undefined,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function formatContent(content: string): string {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "a",
      "em",
      "strong",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "img",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
  });

  // Wrap bare text (non-HTML) in paragraphs
  if (!clean.startsWith("<")) {
    return clean
      .split("\n\n")
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }
  return clean;
}

// ─── Share Button wrapper ────────────────────────────────────

function ArticleShareButton({ title }: { title: string }) {
  return (
    <ShareButton
      title={title}
      text={`Read "${title}" on CineStack`}
      variant="button"
    />
  );
}

// ─── Article Content ─────────────────────────────────────────

async function ArticleContent({ slug }: { slug: string }) {
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const readTime = readingTime(article.content);
  const formattedContent = formatContent(article.content);

  return (
    <article>
      {/* Back link */}
      <Link
        href="/news"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to News
      </Link>

      {/* Hero */}
      <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-bg-alt">
            <span className="font-display text-6xl text-accent/20">
              CN
            </span>
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
      </div>

      {/* Article header */}
      <div className="mx-auto max-w-[720px]">
        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          {article.author && "name" in article.author && article.author.name && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(article.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl leading-tight text-text md:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-text-secondary">
            {article.excerpt}
          </p>
        )}

        {/* Share button */}
        <div className="mt-6 flex items-center gap-4 border-b border-border pb-6">
          <ArticleShareButton title={article.title} />
          {article.source === "tmdb_auto" && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Auto-generated
            </span>
          )}
        </div>

        {/* Article body */}
        <div
          className="prose-custom mt-8 space-y-5 leading-relaxed text-text"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        {/* Footer */}
        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            <ChevronLeft className="h-4 w-4" />
            More articles
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6 md:py-12 lg:px-8">
      <ArticleContent slug={slug} />
    </div>
  );
}
