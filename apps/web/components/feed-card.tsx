import Link from "next/link";
import Image from "next/image";
import { formatKSTDate, toKSTDateString } from "@/lib/date-utils";
import { TagBadge } from "@/components/Tag/tag-badge";
import type { FeedListItem } from "@/types";

interface Props {
  feed: FeedListItem;
}

export function FeedCard({ feed }: Props) {
  const dateStr = toKSTDateString(feed.date);
  const firstSection = feed.sections[0];

  return (
    <Link href={`/feed/${dateStr}`}>
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative w-full h-44">
          {feed.article?.ogImage ? (
            <Image
              src={feed.article.ogImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 680px"
            />
          ) : (
            <Image
              src={"/images/thumbnail-default-img-1.png"}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 680px"
            />
          )}
        </div>

        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-1">
            {formatKSTDate(feed.date)}
          </p>
          {firstSection && (
            <h3 className="font-semibold leading-snug">{firstSection.title}</h3>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            {feed.tags.map(({ tag }) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
