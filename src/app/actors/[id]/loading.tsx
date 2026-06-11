export default function ActorDetailLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-10 lg:px-8">
      {/* Hero skeleton — matches the rounded-2xl + p-6 container */}
      <div className="relative mb-14 overflow-hidden rounded-2xl">
        <div className="p-6 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            {/* Profile photo */}
            <div className="mx-auto w-48 flex-shrink-0 md:mx-0 md:w-64">
              <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface" />
            </div>

            {/* Info */}
            <div className="flex max-w-2xl flex-1 flex-col gap-4">
              {/* Name + Share button */}
              <div className="flex items-start justify-between gap-4">
                <div className="h-10 w-64 animate-pulse rounded bg-surface md:h-12 md:w-80" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-surface" />
              </div>

              {/* Bio line */}
              <div className="h-5 w-full animate-pulse rounded bg-surface" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-surface" />

              {/* Details cards grid */}
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-surface p-3">
                    <div className="mb-2 h-3 w-10 animate-pulse rounded bg-surface-hover" />
                    <div className="h-5 w-20 animate-pulse rounded bg-surface-hover" />
                  </div>
                ))}
              </div>

              {/* Known for tags */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-7 w-28 animate-pulse rounded-full bg-surface" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biography section skeleton */}
      <div className="mb-14">
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-surface" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-surface" />
          <div className="h-4 w-full animate-pulse rounded bg-surface" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-surface" />
          <div className="h-4 w-full animate-pulse rounded bg-surface" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-surface" />
        </div>
      </div>

      {/* Filmography section skeleton — matches horizontal FilmCard layout */}
      <div className="mb-14">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex overflow-hidden rounded-xl border border-border bg-surface">
              <div className="h-24 w-16 flex-shrink-0 animate-pulse bg-surface-hover sm:h-28 sm:w-20" />
              <div className="flex flex-1 flex-col justify-center gap-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
