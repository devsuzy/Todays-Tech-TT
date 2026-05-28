import Link from "next/link";
import Image from "next/image";
import type { FeedDetail } from "@/types";

interface Props {
  feed: FeedDetail;
  tomorrowDate: string; // "YYYY-MM-DD"
}

export function TomorrowFeedCard({ feed, tomorrowDate }: Props) {
  return (
    <Link href={`/feed/${tomorrowDate}`}>
      <div className="flex flex-col gap-4 md:gap-6 items-center rounded-lg bg-white md:flex-row">
        <div className="relative w-full md:flex-1 h-44 rounded-md overflow-hidden">
          <Image
            src={feed.article?.ogImage ?? "/images/thumbnail-default-img-1.png"}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {feed.article?.title && (
            <h3 className="font-semibold text-base leading-snug line-clamp-2">
              {feed.article.title}
            </h3>
          )}
          {feed.article?.source?.name && (
            <p className="text-xs text-muted-foreground">
              {feed.article.source.name}
            </p>
          )}
          <div className="space-y-1 pt-1">
            {feed.sections.map((section) => (
              <div key={section.id} className="text-foreground/80">
                <p className="text-sm font-medium">
                  {section.order}. {section.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
