import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFeed } from "@/lib/api";
import { FeedSectionItem } from "@/components/feed-section-item";
import { FeedArticleHeader } from "@/components/feed-article-header";
import { TomorrowPreview } from "@/components/tomorrow-preview";
import { Header } from "@/components/Layout/header";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/json-ld";
import {
  formatKSTDateLong,
  getTodayKSTString,
  getTomorrowKSTString,
  toKSTDateString,
} from "@/lib/date-utils";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  toMetaDescription,
} from "@/lib/site";
import { ShareButton } from "@/components/Button/share-button";
import { BackButton } from "@/components/Button/back-button";
import { ListButton } from "@/components/Button/list-button";
import { BotMessageSquare, LockKeyholeOpen } from "lucide-react";
import type { FeedDetail } from "@/types";

/** /feed/today 처럼 별칭으로 들어와도 실제 KST 날짜로 맞춘다 */
function resolveDate(date: string) {
  return date === "today" ? getTodayKSTString() : date;
}

/** 요약 첫 문단을 description 으로 쓰고, 없으면 사이트 기본 문구로 대체한다 */
function buildDescription(feed: FeedDetail) {
  const body = feed.sections[0]?.body;
  return body ? toMetaDescription(body) : SITE_DESCRIPTION;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const feed = await getFeed(resolveDate(date));
  if (!feed) return { title: SITE_NAME };

  const feedDate = toKSTDateString(feed.date);
  const title = feed.article?.title ?? `${formatKSTDateLong(feed.date)} 기술 아티클 요약`;
  const description = buildDescription(feed);
  const ogImage = feed.article?.ogImage ?? DEFAULT_OG_IMAGE;
  const canonical = `/feed/${feedDate}`;
  const tags = feed.tags.map(({ tag }) => tag.name);

  return {
    title,
    description,
    keywords: tags,
    alternates: { canonical },
    // 내일 피드 미리보기(DRAFT)는 정식 공개 전이므로 색인에서 제외한다
    ...(feed.status === "DRAFT"
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      locale: "ko_KR",
      publishedTime: feed.date,
      tags,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const resolvedDate = resolveDate(date);
  const feed = await getFeed(resolvedDate);

  if (!feed) notFound();

  const tomorrowDate = getTomorrowKSTString();
  const feedDate = toKSTDateString(feed.date);
  const pageUrl = `${SITE_URL}/feed/${feedDate}`;
  const title = feed.article?.title ?? `${formatKSTDateLong(feed.date)} 기술 아티클 요약`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        headline: title,
        description: buildDescription(feed),
        image: feed.article?.ogImage ?? `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        datePublished: feed.date,
        dateModified: feed.date,
        inLanguage: "ko-KR",
        keywords: feed.tags.map(({ tag }) => tag.name).join(", "),
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        author: { "@type": "Organization", name: feed.article?.source.name ?? SITE_NAME },
        publisher: { "@id": `${SITE_URL}/#organization` },
        ...(feed.article ? { isBasedOn: feed.article.originalUrl } : {}),
        articleBody: feed.sections.map((s) => `${s.title}\n${s.body}`).join("\n\n"),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "아카이브", item: `${SITE_URL}/archive` },
          { "@type": "ListItem", position: 2, name: title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {feed.status === "PUBLISHED" && <JsonLd data={jsonLd} />}

        {feed.status === 'DRAFT' && <DraftBanner />}

        {/* Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <time dateTime={feedDate} className="text-lg font-bold md:text-xl">
            {formatKSTDateLong(feed.date)}
          </time>
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
