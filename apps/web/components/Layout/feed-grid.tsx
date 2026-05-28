"use client";

import { useState, useEffect, useRef } from "react";
import { FeedCard } from "@/components/Card/feed-card";
import { getFeeds } from "@/lib/api";
import type { FeedListItem } from "@/types";
import ClipLoader from "react-spinners/ClipLoader";

const PAGE_SIZE = 20;

interface Props {
  initialFeeds: FeedListItem[];
  tag?: string;
}

export function FeedGrid({ initialFeeds, tag }: Props) {
  const [feeds, setFeeds] = useState(initialFeeds);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialFeeds.length === PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFeeds(initialFeeds);
    setHasMore(initialFeeds.length === PAGE_SIZE);
  }, [tag, initialFeeds]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);

        const more = await getFeeds(tag, feeds.length, PAGE_SIZE);
        setFeeds((prev) => [...prev, ...more]);
        setHasMore(more.length === PAGE_SIZE);

        setLoading(false);
        loadingRef.current = false;
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feeds.length, hasMore, tag]);

  return (
    <>
      <div className="flex flex-col gap-6 mt-6 md:grid md:grid-cols-2 xl:grid-cols-3">
        {feeds.length === 0 ? (
          <p className="text-muted-foreground py-16">피드가 없습니다.</p>
        ) : (
          feeds.map((feed) => <FeedCard key={feed.id} feed={feed} />)
        )}
      </div>
      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <div className="flex justify-center py-4 animate-pulse col-span-full">
          <ClipLoader color="#000000" />
        </div>
      )}
    </>
  );
}
