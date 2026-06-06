// ─────────────────────────────────────────────────────────────
// Movie Detail Loading State
// ─────────────────────────────────────────────────────────────

export default function MovieDetailLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="relative min-h-[60dvh] md:min-h-[70dvh] bg-surface animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-bg" />
        <div className="relative mx-auto flex h-full min-h-[60dvh] max-w-[1400px] flex-col items-start justify-end gap-6 px-4 pb-10 pt-24 md:min-h-[70dvh] md:flex-row md:items-end md:gap-10 md:px-6 md:pb-16 lg:px-8">
          {/* Poster skeleton */}
          <div className="w-48 flex-shrink-0 md:w-64 lg:w-72">
            <div className="aspect-[2/3] rounded-xl bg-surface-hover" />
          </div>

          {/* Info skeleton */}
          <div className="flex w-full max-w-2xl flex-col gap-4">
            <div className="h-10 w-3/4 rounded bg-surface-hover" />
            <div className="h-5 w-1/2 rounded bg-surface-hover" />
            <div className="flex gap-3">
              <div className="h-7 w-20 rounded-full bg-surface-hover" />
              <div className="h-7 w-16 rounded bg-surface-hover" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-surface-hover" />
              <div className="h-6 w-20 rounded-full bg-surface-hover" />
              <div className="h-6 w-24 rounded-full bg-surface-hover" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-surface-hover" />
              <div className="h-4 w-5/6 rounded bg-surface-hover" />
              <div className="h-4 w-4/6 rounded bg-surface-hover" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <div className="mx-auto max-w-[1400px] space-y-14 px-4 py-10 md:px-6 lg:px-8 md:py-14">
        {/* Cast skeleton */}
        <section>
          <div className="mb-6 h-8 w-16 animate-pulse rounded bg-surface" />
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex w-32 flex-shrink-0 flex-col items-center gap-2 sm:w-36">
                <div className="h-32 w-32 rounded-full bg-surface-hover sm:h-36 sm:w-36" />
                <div className="h-4 w-20 rounded bg-surface-hover" />
                <div className="h-3 w-16 rounded bg-surface-hover" />
              </div>
            ))}
          </div>
        </section>

        {/* Trailer skeleton */}
        <section>
          <div className="mb-6 h-8 w-20 animate-pulse rounded bg-surface" />
          <div className="aspect-video w-full max-w-3xl rounded-xl bg-surface-hover" />
        </section>
      </div>
    </div>
  );
}
