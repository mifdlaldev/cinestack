// ─────────────────────────────────────────────────────────────
// ArticleEditor — Admin rich text editor for news articles
// Client Component: uses React state for form management.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { Save, Send, Eye, FileText } from "lucide-react";
import type { NewsArticleRow } from "@/types/news";
import { createArticle, updateArticle } from "@/actions/news-actions";

interface ArticleEditorProps {
  initialData?: Partial<NewsArticleRow>;
  isEditing?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

type EditorStatus = "idle" | "saving" | "success" | "error";

export function ArticleEditor({
  initialData,
  isEditing = false,
}: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(
    initialData?.cover_image ?? "",
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft",
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [statusMessage, setStatusMessage] = useState<EditorStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value);
  }

  async function handleSave(publishStatus: "draft" | "published") {
    setStatusMessage("saving");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("content", content);
    formData.append("excerpt", excerpt);
    formData.append("cover_image", coverImage);
    formData.append("status", publishStatus);

    let result;
    if (isEditing && initialData?.id) {
      result = await updateArticle(initialData.id, formData);
    } else {
      result = await createArticle(formData);
    }

    if (result.error) {
      setStatusMessage("error");
      setErrorMessage(result.error);
    } else {
      setStatusMessage("success");
      setTimeout(() => setStatusMessage("idle"), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-accent" />
          <h2 className="font-display text-xl text-text">
            {isEditing ? "Edit Article" : "New Article"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicator */}
          {statusMessage === "saving" && (
            <span className="text-sm text-accent">Saving...</span>
          )}
          {statusMessage === "success" && (
            <span className="text-sm text-success">Saved!</span>
          )}

          {/* Save as Draft */}
          <button
            onClick={() => handleSave("draft")}
            disabled={statusMessage === "saving"}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-surface hover:text-text active:scale-[0.97] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          {/* Publish */}
          <button
            onClick={() => handleSave("published")}
            disabled={statusMessage === "saving"}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {errorMessage}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="article-title"
          className="text-sm font-medium text-text-secondary"
        >
          Title
        </label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter article title"
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-lg text-text placeholder:text-text-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label
          htmlFor="article-slug"
          className="text-sm font-medium text-text-secondary"
        >
          Slug
        </label>
        <input
          id="article-slug"
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="article-url-slug"
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 font-mono text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <label
          htmlFor="article-cover"
          className="text-sm font-medium text-text-secondary"
        >
          Cover Image URL
        </label>
        <input
          id="article-cover"
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://image.tmdb.org/t/p/w1280/..."
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 font-mono text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {coverImage && (
          <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt="Cover preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <label
          htmlFor="article-excerpt"
          className="text-sm font-medium text-text-secondary"
        >
          Excerpt
        </label>
        <textarea
          id="article-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary of the article..."
          rows={3}
          className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Content (rich text / HTML) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="article-content"
            className="text-sm font-medium text-text-secondary"
          >
            Content
          </label>
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Eye className="h-3 w-3" />
            HTML supported
          </span>
        </div>
        <textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your article content here... HTML tags are supported: &lt;h2&gt;, &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;, etc."
          rows={16}
          className="w-full rounded-lg border border-border bg-bg-alt px-4 py-3 font-mono text-sm leading-relaxed text-text placeholder:text-text-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Status toggle */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
        <span className="text-sm font-medium text-text-secondary">
          Status:
        </span>
        <button
          onClick={() => setStatus("draft")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            status === "draft"
              ? "bg-text-secondary/20 text-text"
              : "bg-transparent text-text-secondary hover:text-text"
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => setStatus("published")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            status === "published"
              ? "bg-accent/20 text-accent"
              : "bg-transparent text-text-secondary hover:text-text"
          }`}
        >
          Published
        </button>
      </div>
    </div>
  );
}
