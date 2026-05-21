import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatKSTDate, toKSTDateString } from "@/lib/date-utils";
import type { FeedListItem } from "@/types";

interface Props {
  feed: FeedListItem;
}

export function FeedCard({ feed }: Props) {
  const dateStr = toKSTDateString(feed.date);
  const firstSection = feed.sections[0];

  return (
    <Link href={`/feed/${dateStr}`}>
      <div className="border rounded-lg overflow-hidden hover:bg-muted/40 transition-colors">
        {feed.article?.ogImage && (
          <div className="relative w-full h-44">
            <Image
              src={feed.article.ogImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 680px"
            />
          </div>
        )}
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-1">
            {formatKSTDate(feed.date)}
          </p>
          {firstSection && (
            <h3 className="font-semibold leading-snug">{firstSection.title}</h3>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            {feed.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{ borderColor: tag.color ?? undefined }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
