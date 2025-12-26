/**
 * Workshop List Skeleton
 * Loading state for workshop list
 */

export function WorkshopListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-6 animate-pulse"
        >
          {/* Title */}
          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
          
          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>

          {/* Badge */}
          <div className="h-6 bg-muted rounded-full w-32 mb-4" />

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 w-px bg-border" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 w-px bg-border" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}