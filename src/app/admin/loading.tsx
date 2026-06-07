// ─────────────────────────────────────────────────────────────
// Admin Loading — Suspense fallback skeleton
// ─────────────────────────────────────────────────────────────

export default function AdminLoading() {
  return (
    <div className="flex min-h-[100dvh]">
      {/* Sidebar skeleton */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-surface md:block" />

      {/* Content skeleton */}
      <div className="flex-1 space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}
