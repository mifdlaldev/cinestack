import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function MovieCardSkeleton() {
  return (
    <Card size="sm" className="overflow-hidden">
      <div className="aspect-[2/3] w-full">
        <div className="size-full bg-muted" />
      </div>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  )
}
