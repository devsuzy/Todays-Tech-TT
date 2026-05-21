import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFeed } from "@/lib/api";
import { FeedSectionItem } from "@/components/feed-section-item";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatKSTDateLong, getTodayKSTString, getTomorrowKSTString } from "@/lib/date-utils";

export default async function FeedDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const resolvedDate = date === "today" ? getTodayKSTString() : date;
  const feed = await getFeed(resolvedDate);

  if (!feed) notFound();

  const tomorrowDate = getTomorrowKSTString();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/archive"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← 아카이브
        </Link>

        {feed.article?.ogImage && (
          <div className="relative w-full h-56 rounded-xl overflow-hidden mt-4 mb-6">
            <Image
              src={feed.article.ogImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        <h1 className="text-3xl font-bold mt-3 mb-1">
          {formatKSTDateLong(feed.date)}
        </h1>

        {feed.article && (
          <p className="text-sm text-muted-foreground mb-6">
            출처:{" "}
            <a
              href={feed.article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {feed.article.source.name}
            </a>
          </p>
        )}

        <Separator className="mb-8" />

        <div className="space-y-10">
          {feed.sections.map((section) => (
            <FeedSectionItem key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {feed.tags.map(({ tag }) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color ?? undefined }}
              className="text-white text-xs"
            >
              {tag.name}
            </Badge>
          ))}
        </div>

        <Separator className="mt-10 mb-8" />

        <TomorrowPreview tomorrowDate={tomorrowDate} />
      </main>
    </div>
  );
}
