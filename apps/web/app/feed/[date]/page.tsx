import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFeed } from "@/lib/api";
import { FeedSectionItem } from "@/components/feed-section-item";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatKSTDateLong, getTodayKSTString, getTomorrowKSTString } from "@/lib/date-utils";
import { BotMessageSquare, LayoutList } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { BackButton } from "@/components/back-button";

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
      <main className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{formatKSTDateLong(feed.date)}</h3>
          <ShareButton />
        </div>

        {feed.article?.ogImage && (
          <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6">
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

        {feed.article && (
          <h1 className="text-3xl font-bold mb-3 hover:underline">
            <Link
              href={feed.article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className=""
            >
              {feed.article?.title || "No Title"}
            </Link>
          </h1>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
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

        <Separator className="mb-8" />

        <div className="space-y-10">
          <div className="space-y-2">
            <div className="flex text-blue-500 items-center gap-2">
              <BotMessageSquare />
              <p className="font-semibold">AI 요약</p>
            </div>
            <p className="font-medium text-muted-foreground">
              해당 글은 AI가 원문을 분석하여 핵심만 요약한 내용입니다.
            </p>
          </div>

          {feed.sections.map((section) => (
            <FeedSectionItem key={section.id} section={section} />
          ))}
        </div>

        <Separator className="mt-10 mb-8" />

        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LayoutList className="w-4 h-4" />
            목록보기
          </Link>
        </div>

        <TomorrowPreview tomorrowDate={tomorrowDate} />
      </main>
    </div>
  );
}
