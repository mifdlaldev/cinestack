export default function ActorDetailLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8 md:py-12">
      {/* Hero skeleton */}
      <div className="mb-10 flex flex-col gap-8 md:flex-row">
        <div className="mx-auto h-[450px] w-[300px] animate-pulse rounded-xl bg-surface md:mx-0" />
        <div className="flex-1 space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-surface" />
          <div className="h-5 w-48 animate-pulse rounded bg-surface" />
          <div className="h-5 w-36 animate-pulse rounded bg-surface" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-surface" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-surface" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-surface" />
          </div>
        </div>
      </div>

      {/* Filmography skeleton */}
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-surface" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="aspect-[2/3] animate-pulse bg-surface-hover" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
