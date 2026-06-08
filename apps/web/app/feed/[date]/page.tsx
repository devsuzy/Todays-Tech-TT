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
import { BotMessageSquare, LockKeyholeOpen } from "lucide-react";

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
        {feed.status === 'DRAFT' && (
          <div className="flex gap-4 rounded-md bg-primary/10 border border-primary text-primary p-4 mb-6">
            <LockKeyholeOpen />
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium">미리보기 중이에요</p>
              <p className="text-xs text-muted-foreground">
                해당 콘텐츠는 내일 정식으로 공개됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold md:text-xl">{formatKSTDateLong(feed.date)}</h3>
          {feed.status === 'PUBLISHED' && (
            <ShareButton />
          )}
        </div>

        {/* Article Image */}
        <div className="relative w-full h-56 rounded-xl overflow-hidden mb-6 md:h-80">
          {feed.article?.ogImage ? (
            <Image
              src={feed.article.ogImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          ) : (
            <Image
              src={"/images/thumbnail-default-img-1.png"}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              />
            )}
        </div>

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

        
        <div className="flex items-center gap-2 mb-6">
          {/* Source Link */}
          {feed.article && (
            <Link
              href={feed.article.source.homeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline"
            >
              출처: {feed.article.source.name}
            </Link>
          )}

          ᐧ

          {/* Tags */}
          {feed.tags.map(({ tag }) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Content Sections */}
        <div className="space-y-8 md:space-y-10">
          <div className="space-y-2">
            <div className="flex text-primary items-center gap-2">
              <BotMessageSquare />
              <p className="font-semibold text-sm md:text-base">AI 요약</p>
            </div>
            <p className="font-medium text-muted-foreground text-sm md:text-base">
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
        {feed.status === 'PUBLISHED' && (
          <TomorrowPreview tomorrowDate={tomorrowDate} />
        )}
      </main>
    </div>
  );
}
