// ─────────────────────────────────────────────────────────────
// Admin News Management — List, create, edit, delete articles
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format-relative-time";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  source: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticlesResponse {
  data: Article[];
  count: number;
  page: number;
  totalPages: number;
}

interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  cover_image: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <h3 className="font-display text-lg text-text">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-sm text-text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-bg px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

function ArticleEditor({
  article,
  onClose,
}: {
  article?: Article | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft",
  );
  const [coverImage, setCoverImage] = useState(article?.cover_image ?? "");

  const saveMutation = useMutation({
    mutationFn: async (data: ArticleFormData & { slug: string }) => {
      const url = isEditing
        ? `/api/admin/news/${article.id}`
        : "/api/admin/news";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save article");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      onClose();
    },
  });

  const handleSave = (publish: boolean) => {
    const finalStatus = publish ? "published" : "draft";
    setStatus(finalStatus);
    saveMutation.mutate({
      title,
      excerpt,
      content,
      status: finalStatus,
      cover_image: coverImage,
      slug: slugify(title),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text">
          {isEditing ? "Edit Article" : "New Article"}
        </h2>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          aria-label="Close editor"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="article-title"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Title
          </label>
          <input
            id="article-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="article-excerpt"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Excerpt
          </label>
          <input
            id="article-excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary (optional)"
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label
            htmlFor="article-cover"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Cover Image URL
          </label>
          <input
            id="article-cover"
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg (optional)"
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="article-content"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Content
          </label>
          <textarea
            id="article-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article content here..."
            rows={12}
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-y min-h-[200px]"
          />
        </div>
      </div>

      {/* Error */}
      {saveMutation.isError && (
        <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3">
          <p className="text-sm text-error">
            {saveMutation.error instanceof Error
              ? saveMutation.error.message
              : "Failed to save article"}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-border bg-bg px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface active:scale-[0.97]"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saveMutation.isPending || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          Save as Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saveMutation.isPending || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isEditing ? "Update & Publish" : "Publish"}
        </button>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ArticlesResponse>({
    queryKey: ["admin-news", page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      const res = await fetch(`/api/admin/news?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch articles");
      }
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const res = await fetch(`/api/admin/news/${articleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete article");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    },
  });

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    deleteMutation.mutate(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const openEditor = (article?: Article) => {
    setEditingArticle(article ?? null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingArticle(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            News
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Create and manage articles
          </p>
        </div>
        {!editorOpen && (
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        )}
      </div>

      {/* Editor panel */}
      {editorOpen && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <ArticleEditor article={editingArticle} onClose={closeEditor} />
        </div>
      )}

      {/* Loading */}
      {!editorOpen && isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      )}

      {/* Error */}
      {!editorOpen && isError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4">
          <p className="text-sm text-error">
            {error instanceof Error ? error.message : "Failed to load articles"}
          </p>
        </div>
      )}

      {/* Table */}
      {!editorOpen && !isLoading && !isError && data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">
                    Author
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-text-secondary"
                    >
                      No articles yet. Click &quot;New Article&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  data.data.map((article) => (
                    <tr
                      key={article.id}
                      className="bg-bg transition-colors hover:bg-surface/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/news/${article.slug}`}
                          className="font-medium text-text transition-colors hover:text-accent"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                            (article.status === "published"
                              ? "bg-success/10 text-success"
                              : "bg-text-secondary/10 text-text-secondary")
                          }
                        >
                          {article.status === "published" ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {article.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                        {article.author_id.slice(0, 8)}...
                      </td>
                      <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                        {article.published_at
                          ? formatRelativeTime(article.published_at)
                          : formatRelativeTime(article.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditor(article)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                id: article.id,
                                title: article.title,
                              })
                            }
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Delete mutation error */}
          {deleteMutation.isError && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-3">
              <p className="text-sm text-error">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Failed to delete article"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {data.page} of {data.totalPages} ({data.count} total articles)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
