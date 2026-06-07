export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[2/3] animate-pulse rounded-lg bg-surface" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
