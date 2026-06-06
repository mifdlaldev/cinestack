// ─────────────────────────────────────────────────────────────
// News Article Types
// ─────────────────────────────────────────────────────────────

/** Raw author shape returned by Supabase join queries. */
export type NewsAuthor =
  | { name: string | null; avatar_url: string | null }
  | { name: string | null; avatar_url: string | null }[]
  | null;

/** Normalized author info. */
export interface NewsAuthorInfo {
  name: string | null;
  avatar_url: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  source: "manual" | "tmdb_auto";
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author: NewsAuthorInfo | null;
}

export interface NewsArticleRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  source: "manual" | "tmdb_auto";
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface NewsArticleFormValues {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status: "draft" | "published";
}

export interface NewsPaginatedResponse {
  data: NewsArticle[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Normalize Supabase join result (which can be array or single) to nullable object. */
export function normalizeAuthor(
  author: NewsAuthor,
): NewsAuthorInfo | null {
  if (!author) return null;
  if (Array.isArray(author)) {
    return author[0] ?? null;
  }
  return author;
}
