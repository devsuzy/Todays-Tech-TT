"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Tag } from "@/types";

interface Props {
  tags: Tag[];
}

export function TagFilterBar({ tags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get("tag") ?? undefined;

  function handleTagClick(slug?: string) {
    router.push(slug ? `/archive?tag=${slug}` : "/archive");
  }

  const baseClass =
    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer md:text-base";
  const activeClass = "bg-foreground text-background border-foreground";
  const inactiveClass =
    "bg-background text-foreground border-border hover:bg-muted";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleTagClick()}
        className={`${baseClass} ${!selectedTag ? activeClass : inactiveClass}`}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.slug)}
          className={`${baseClass} ${selectedTag === tag.slug ? "text-white border-transparent" : inactiveClass}`}
          style={
            selectedTag === tag.slug
              ? { backgroundColor: tag.color ?? "#666" }
              : undefined
          }
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
