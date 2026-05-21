import { getFeeds, getTags } from "@/lib/api";
import { FeedCard } from "@/components/feed-card";
import { TagFilterBar } from "@/components/tag-filter-bar";
import { Header } from "@/components/header";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [feeds, tags] = await Promise.all([getFeeds(tag), getTags()]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">아카이브</h1>
        <TagFilterBar tags={tags} selectedTag={tag} />
        <div className="mt-6 space-y-3">
          {feeds.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">
              피드가 없습니다.
            </p>
          ) : (
            feeds.map((feed) => <FeedCard key={feed.id} feed={feed} />)
          )}
        </div>
      </main>
    </div>
  );
}
