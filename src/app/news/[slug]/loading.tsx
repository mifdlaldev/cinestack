// ─────────────────────────────────────────────────────────────
// News Article Loading State
// ─────────────────────────────────────────────────────────────

export default function NewsArticleLoading() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6 md:py-12 lg:px-8">
      {/* Back link skeleton */}
      <div className="mb-8 h-4 w-28 animate-pulse rounded bg-surface" />

      {/* Hero skeleton */}
      <div className="mb-8 aspect-[21/9] w-full animate-pulse rounded-xl bg-surface" />

      {/* Article header skeleton */}
      <div className="mx-auto max-w-[720px]">
        {/* Meta skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface" />
          <div className="h-4 w-20 animate-pulse rounded bg-surface" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded bg-surface" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface" />
        </div>

        {/* Excerpt skeleton */}
        <div className="mt-4 space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-surface" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-surface" />
        </div>

        {/* Divider skeleton */}
        <div className="mt-6 border-b border-border pb-6" />

        {/* Body skeleton */}
        <div className="mt-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-4 w-full animate-pulse rounded bg-surface" />
              <div
                className="h-4 animate-pulse rounded bg-surface"
                style={{ width: `${((i % 3) + 6) * 10}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
