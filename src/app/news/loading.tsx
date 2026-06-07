export default function NewsLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8 md:py-12">
      <div className="mb-8 h-10 w-48 animate-pulse rounded bg-surface" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="aspect-video animate-pulse bg-surface-hover" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-1/4 animate-pulse rounded bg-surface-hover" />
              <div className="h-6 w-full animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
