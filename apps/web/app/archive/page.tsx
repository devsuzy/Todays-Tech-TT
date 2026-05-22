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
    <div className="min-h-screen bg-muted/50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 md:max-w-3xl xl:max-w-5xl">
        <TagFilterBar tags={tags} selectedTag={tag} />
        <div className="flex flex-col gap-6 mt-6 md:grid md:grid-cols-2 xl:grid-cols-3">
          {feeds.length === 0 ? (
            <p className="text-muted-foreground py-16">
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
