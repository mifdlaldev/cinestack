export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] w-full rounded-lg bg-surface" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-surface" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-12 rounded bg-surface" />
          <div className="h-3 w-16 rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}
