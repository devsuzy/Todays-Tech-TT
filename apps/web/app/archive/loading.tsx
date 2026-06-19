import { FeedSkeleton } from "@/components/feed-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/50">
      <main className="max-w-2xl mx-auto px-4 py-8 md:max-w-3xl xl:max-w-5xl">
        <FeedSkeleton />
      </main>
    </div>
  );
}
