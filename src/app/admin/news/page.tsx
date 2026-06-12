// ─────────────────────────────────────────────────────────────
// Admin News Management — List, create, edit, delete articles
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
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
  Upload,
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
  author_name: string;
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
  pageSize: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft",
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    article?.cover_image ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      queryClient.resetQueries({ queryKey: ["admin-news"] });
      onClose();
    },
  });

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    try {
      let coverUrl = coverRemoved ? "" : (article?.cover_image ?? "");

      // Upload new cover if a file was selected
      if (coverFile) {
        const ext = coverFile.name.split(".").pop() ?? "jpg";
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const supabase = createClient();

        const { error: uploadError } = await supabase.storage
          .from("news-covers")
          .upload(filePath, coverFile, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage
          .from("news-covers")
          .getPublicUrl(filePath);

        coverUrl = urlData.publicUrl;
      }

      // Delete old cover from storage if removed
      if (coverRemoved && article?.cover_image) {
        const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-covers/`;
        if (article.cover_image.startsWith(prefix)) {
          const supabase = createClient();
          const filePath = article.cover_image.slice(prefix.length);
          await supabase.storage.from("news-covers").remove([filePath]);
        }
      }

      const finalStatus = publish ? "published" : "draft";
      setStatus(finalStatus);

      await saveMutation.mutateAsync({
        title,
        excerpt,
        content,
        status: finalStatus,
        cover_image: coverUrl,
        slug: slugify(title),
      });
    } catch (err) {
      if (err instanceof Error && err.message !== "Failed to save") {
        alert(err instanceof Error ? err.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
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

        {/* Cover Image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            Cover Image
          </label>
          <div className="flex items-start gap-4">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-20 w-32 flex-shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-all hover:bg-surface-hover active:scale-[0.97]"
              >
                <Upload className="h-4 w-4" />
                {coverPreview ? "Change Image" : "Choose Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverSelect}
              />
              {coverPreview && (
                <button
                  type="button"
                  onClick={removeCover}
                  className="text-left text-xs text-error/70 hover:text-error"
                >
                  Remove image
                </button>
              )}
              {!coverPreview && !article?.cover_image && (
                <p className="text-xs text-text-secondary/60">
                  Image will be uploaded when you save
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            Content
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your article content here..."
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
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-all hover:bg-surface-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          Save as Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
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
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["No.", "Image", "Title", "Status", "Author", "Date", "Published", "Time", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="bg-bg">
                  <td className="px-4 py-3"><div className="h-4 w-6 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-10 w-14 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-surface-hover" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><div className="h-4 w-24 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 animate-pulse rounded bg-surface-hover" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-surface-hover" /></td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <th className="w-12 px-4 py-3 text-left font-medium text-text-secondary">
                    No.
                  </th>
                  <th className="w-16 px-4 py-3 text-left font-medium text-text-secondary">
                    Image
                  </th>
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
                  <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">
                    Published
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-text-secondary md:table-cell">
                    Time
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
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm text-text-secondary"
                    >
                      No articles yet. Click &quot;New Article&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  data.data.map((article, idx) => (
                    <tr
                      key={article.id}
                      className="bg-bg transition-colors hover:bg-surface/50"
                    >
                      <td className="w-12 px-4 py-3 text-xs text-text-secondary">
                        {(data.page - 1) * data.pageSize + idx + 1}
                      </td>
                      <td className="w-16 px-4 py-3">
                        {article.cover_image ? (
                          <Link href={`/news/${article.slug}`}>
                            <img
                              src={article.cover_image}
                              alt={article.title}
                              className="h-10 w-14 rounded object-cover transition-opacity hover:opacity-80"
                            />
                          </Link>
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded bg-surface">
                            <span className="text-[10px] text-text-secondary/40">N/A</span>
                          </div>
                        )}
                      </td>
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
                        {article.author_name}
                      </td>
                      <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                        {article.published_at
                          ? formatRelativeTime(article.published_at)
                          : formatRelativeTime(article.created_at)}
                      </td>
                      <td className="hidden px-4 py-3 text-text-secondary whitespace-nowrap md:table-cell">
                        {new Date(article.published_at ?? article.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="hidden px-4 py-3 text-text-secondary whitespace-nowrap md:table-cell">
                        {new Date(article.published_at ?? article.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit", minute: "2-digit", hour12: false,
                        })}
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
