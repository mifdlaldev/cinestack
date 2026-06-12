// ─────────────────────────────────────────────────────────────
// Admin Loading — Suspense fallback skeleton
// ─────────────────────────────────────────────────────────────

export default function AdminLoading() {
  return (
    <div className="flex min-h-[100dvh]">
      {/* Sidebar skeleton */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="h-6 w-24 animate-pulse rounded bg-surface-hover" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {["Dashboard", "Users", "Movies", "Reviews", "Replies", "News"].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <div className="h-5 w-5 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
            </div>
          ))}
        </nav>

        {/* Back to site */}
        <div className="border-t border-border px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="h-4 w-4 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar skeleton */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-end px-4 py-3 lg:hidden">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 bg-bg lg:pt-8">
        <div className="space-y-6 px-4 pb-12 pt-16 md:px-6 lg:px-8 lg:pt-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-surface-hover" />
                <div className="space-y-2">
                  <div className="h-7 w-16 animate-pulse rounded bg-surface-hover" />
                  <div className="h-3 w-20 animate-pulse rounded bg-surface-hover" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
