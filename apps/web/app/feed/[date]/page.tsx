import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFeed } from "@/lib/api";
import { FeedSectionItem } from "@/components/feed-section-item";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { Header } from "@/components/Layout/header";
import { Separator } from "@/components/ui/separator";
import { TagBadge } from "@/components/Tag/tag-badge";
import { formatKSTDateLong, getTodayKSTString, getTomorrowKSTString } from "@/lib/date-utils";
import { ShareButton } from "@/components/Button/share-button";
import { BackButton } from "@/components/Button/back-button";
import { ListButton } from "@/components/Button/list-button";
import { BotMessageSquare } from "lucide-react";

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
        {/* Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold md:text-xl">{formatKSTDateLong(feed.date)}</h3>
          <ShareButton />
        </div>

        {/* Article Image */}
        {feed.article?.ogImage && (
          <div className="relative w-full h-56 rounded-xl overflow-hidden mb-6 md:h-80">
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

        {/* Article Title */}
        {feed.article && (
          <h1 className="text-xl font-bold mb-4 hover:underline md:text-3xl">
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

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {feed.tags.map(({ tag }) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Content Sections */}
        <div className="space-y-8 md:space-y-10">
          <div className="space-y-2">
            <div className="flex text-blue-500 items-center gap-2">
              <BotMessageSquare />
              <p className="font-semibold text-sm md:text-base">AI 요약</p>
            </div>
            <p className="font-medium text-muted-foregroun text-sm md:text-base">
              해당 글은 AI가 원문을 분석하여 핵심만 요약한 내용입니다.
            </p>
          </div>

          {feed.sections.map((section) => (
            <FeedSectionItem key={section.id} section={section} />
          ))}
        </div>

        <Separator className="mt-10 mb-8" />

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <ListButton />
        </div>

        {/* Tomorrow Preview */}
        <TomorrowPreview tomorrowDate={tomorrowDate} />
      </main>
    </div>
  );
}
