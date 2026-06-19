import { Skeleton } from "@/components/ui/skeleton";

function FeedCardSkeleton() {
  return (
    <div className="rounded-lg shadow-sm overflow-hidden bg-white">
      <Skeleton className="w-full h-44 rounded-none" />
      <div className="p-5 flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24 mt-1" />
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6 mt-6 md:grid md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}
