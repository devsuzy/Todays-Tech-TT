import Link from "next/link";
import Image from "next/image";
import { TagBadge } from "@/components/Tag/tag-badge";
import type { FeedDetail } from "@/types";

interface Props {
  feed: FeedDetail;
}

export function FeedArticleHeader({ feed }: Props) {
  return (
    <>
      {/* Article Image */}
      <div className="relative w-full h-56 rounded-xl overflow-hidden mb-6 md:h-80">
        <Image
          src={feed.article?.ogImage || "/images/thumbnail-default-img-1.png"}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
          priority
        />
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
            {feed.article.title || "No Title"}
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
    </>
  );
}
