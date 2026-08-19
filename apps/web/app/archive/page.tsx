import { Suspense } from "react";
import type { Metadata } from "next";
import { getFeeds, getTags } from "@/lib/api";
import { TagFilterBar } from "@/components/Tag/tag-filter-bar";
import { Header } from "@/components/Layout/header";
import { Footer } from "@/components/Layout/footer";
import { FeedGrid } from "@/components/feed-grid";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { JsonLd } from "@/components/json-ld";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** 실제 존재하는 태그일 때만 canonical에 반영한다 (임의 쿼리로 중복 URL이 생기는 것을 막음) */
async function resolveTagName(slug?: string) {
  if (!slug) return undefined;
  const tags = await getTags();
  return tags.find((t) => t.slug === slug)?.name;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}): Promise<Metadata> {
  const { tag } = await searchParams;
  const tagName = await resolveTagName(tag);

  const title = tagName ? `${tagName} 기술 아티클 모음` : "테크 아티클 아카이브";
  const description = tagName
    ? `${tagName} 관련 국내 기술 블로그 아티클을 AI가 3줄로 요약해 매일 발행합니다.`
    : SITE_DESCRIPTION;
  // ?slack=connected 같은 부가 쿼리는 canonical에서 제외된다
  const canonical = tagName ? `/archive?tag=${tag}` : "/archive";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "ko_KR",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

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
  const tagName = tags.find((t) => t.slug === tag)?.name;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "아카이브",
        item: `${SITE_URL}/archive`,
      },
      ...(tagName
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: tagName,
              item: `${SITE_URL}/archive?tag=${tag}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 md:max-w-3xl xl:max-w-5xl min-h-[calc(100vh-3.5rem)]">
        <JsonLd data={breadcrumbJsonLd} />

        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            {tagName ? `${tagName} 기술 아티클 모음` : "오늘의 기술 아티클"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            국내 주요 기술 블로그를 매일 크롤링해 AI가 핵심만 요약해 드립니다.
          </p>
        </div>

        <TagFilterBar tags={tags} />
        <Suspense key={tag} fallback={<FeedSkeleton />}>
          <FeedContent tag={tag} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
