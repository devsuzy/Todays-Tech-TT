import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFeed } from "@/lib/api";
import { FeedSectionItem } from "@/components/feed-section-item";
import { FeedArticleHeader } from "@/components/feed-article-header";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { Header } from "@/components/Layout/header";
import { Separator } from "@/components/ui/separator";
import { formatKSTDateLong, getTodayKSTString, getTomorrowKSTString } from "@/lib/date-utils";
import { ShareButton } from "@/components/Button/share-button";
import { BackButton } from "@/components/Button/back-button";
import { ListButton } from "@/components/Button/list-button";
import { BotMessageSquare, LockKeyholeOpen } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const feed = await getFeed(date);
  if (!feed) return { title: "TT - Today's Tech" };

  const title = feed.article?.title ?? "Today's Tech";
  const ogImage = feed.article?.ogImage ?? '/images/og-image.png';

  return {
    title: `${title} | TT`,
    openGraph: {
      title,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [ogImage],
    },
  };
}

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
        {feed.status === 'DRAFT' && <DraftBanner />}

        {/* Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold md:text-xl">{formatKSTDateLong(feed.date)}</h3>
          {feed.status === 'PUBLISHED' && (
            <ShareButton />
          )}
        </div>

        <FeedArticleHeader feed={feed} />

        <Separator className="mb-8" />

        {/* Content Sections */}
        <div className="space-y-8 md:space-y-10">
          <AiSummaryNotice />

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

        {feed.status === 'PUBLISHED' && (
          <TomorrowPreview tomorrowDate={tomorrowDate} />
        )}
      </main>
    </div>
  );
}

function DraftBanner() {
  return (
    <div className="flex gap-4 rounded-md bg-primary/10 border border-primary text-primary p-4 mb-6">
      <LockKeyholeOpen />
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium">미리보기 중이에요</p>
        <p className="text-xs text-muted-foreground">
          해당 콘텐츠는 내일 정식으로 공개됩니다.
        </p>
      </div>
    </div>
  );
}

function AiSummaryNotice() {
  return (
    <div className="space-y-2">
      <div className="flex text-primary items-center gap-2">
        <BotMessageSquare />
        <p className="font-semibold text-sm md:text-base">AI 요약</p>
      </div>
      <p className="font-medium text-muted-foreground text-sm md:text-base">
        해당 글은 AI가 원문을 분석하여 핵심만 요약한 내용입니다.
      </p>
    </div>
  );
}
