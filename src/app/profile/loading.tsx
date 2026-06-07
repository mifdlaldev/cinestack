export default function Loading() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:text-left">
        <div className="h-20 w-20 animate-pulse rounded-full bg-surface sm:h-24 sm:w-24" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-surface" />
          <div className="h-5 w-64 animate-pulse rounded bg-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 animate-pulse rounded-xl bg-surface" />
        <div className="h-24 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}
