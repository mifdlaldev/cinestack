export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8 md:py-12">
      <div className="mb-8 space-y-2">
        <div className="h-10 w-64 animate-pulse rounded bg-surface" />
        <div className="h-5 w-96 animate-pulse rounded bg-surface" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6">
            <div className="h-12 w-12 animate-pulse rounded-full bg-surface-hover" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}
