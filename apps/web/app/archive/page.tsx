import { Suspense } from "react";
import { getFeeds, getTags } from "@/lib/api";
import { TagFilterBar } from "@/components/Tag/tag-filter-bar";
import { Header } from "@/components/Layout/header";
import { Footer } from "@/components/Layout/footer";
import { FeedGrid } from "@/components/feed-grid";
import { FeedSkeleton } from "@/components/feed-skeleton";

async function FeedContent({ tag }: { tag?: string }) {
  const feeds = await getFeeds(tag, 0, 20);
  return <FeedGrid initialFeeds={feeds} tag={tag} />;
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const tags = await getTags();

  return (
    <div className="min-h-screen bg-muted/50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 md:max-w-3xl xl:max-w-5xl min-h-[calc(100vh-3.5rem)]">
        <TagFilterBar tags={tags} />
        <Suspense key={tag} fallback={<FeedSkeleton />}>
          <FeedContent tag={tag} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
