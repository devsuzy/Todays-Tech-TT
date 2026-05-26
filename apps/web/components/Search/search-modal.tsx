"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedCard } from "@/components/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchFeeds } from "@/lib/api";
import type { FeedListItem } from "@/types";
import { MessageCircleQuestionMark } from "lucide-react";

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FeedListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      const data = await searchFeeds(q);
      setResults(data);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  const trimmedQuery = query.trim();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="검색"
      >
        <Search />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-4 flex flex-col min-h-screen gap-4 md:gap-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg tracking-tight">
                Today&apos;s Tech
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="닫기"
              >
                <X />
              </Button>
            </div>

            {/* 검색 입력 */}
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full h-10 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />

            {/* 결과 */}
            {isLoading && trimmedQuery && (
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            )}

            {!isLoading && hasSearched && trimmedQuery && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                <MessageCircleQuestionMark />
                <p className="text-center text-sm md:text-base">
                  검색 결과가 없습니다.
                </p>
              </div>
            )}

            {!isLoading && trimmedQuery && results.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {results.map((feed) => (
                  <div key={feed.id} onClick={handleClose}>
                    <FeedCard feed={feed} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
