"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TomorrowFeedCard } from "@/components/Card/tomorrow-feed-card";
import { Progress } from "@/components/ui/progress";
import { getTomorrowFeed } from "@/lib/api";
import type { FeedDetail } from "@/types";
import { LockKeyhole, Sparkles, ChevronRight } from "lucide-react";

type PreviewState = "LOCKED" | "WATCHING" | "UNLOCKED";

type PreviewToken = {
  unlockedAt: string;
  expiresAt: string;
};

interface Props {
  tomorrowDate: string; // "YYYY-MM-DD"
}

function getStorageKey(date: string) {
  return `tt_preview_${date}`;
}

function getKSTMidnightUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  // KST midnight (00:00) = UTC the previous day at 15:00
  return new Date(Date.UTC(year, month - 1, day) - 9 * 60 * 60 * 1000);
}

export function TomorrowPreview({ tomorrowDate }: Props) {
  const [state, setState] = useState<PreviewState>("LOCKED");
  const [progress, setProgress] = useState(0);
  const [tomorrowFeed, setTomorrowFeed] = useState<FeedDetail | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const key = getStorageKey(tomorrowDate);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const token = JSON.parse(raw) as PreviewToken;
      if (new Date(token.expiresAt) > new Date()) {
        setState("UNLOCKED");
        getTomorrowFeed().then(setTomorrowFeed);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }, [tomorrowDate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleStartWatching() {
    setState("WATCHING");
    setProgress(0);
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min((elapsed / 5000) * 100, 100));
      if (elapsed >= 5000) {
        clearInterval(intervalRef.current!);
        unlock();
      }
    }, 100);
  }

  function unlock() {
    const key = getStorageKey(tomorrowDate);
    const token: PreviewToken = {
      unlockedAt: new Date().toISOString(),
      expiresAt: getKSTMidnightUTC(tomorrowDate).toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(token));
    setState("UNLOCKED");
    getTomorrowFeed().then(setTomorrowFeed);
  }

  const secondsLeft = Math.ceil((5000 - (progress / 100) * 5000) / 1000);

  return (
    <div className="border-accent rounded-lg bg-muted/20">
      {state === "LOCKED" && (
        <div className="flex flex-col items-center text-center gap-4 md:gap-6 border border-accent bg-linear-to-b from-primary/30 to-white rounded-lg p-6 md:p-8">
          <div className="bg-background rounded-full p-4">
            <LockKeyhole className="text-primary" />
          </div>
          <p className="text-base font-medium md:text-lg">
            짧은 광고를 시청하면 <br/> 내일의 피드를 미리 볼 수 있어요.
          </p>
          <Button onClick={handleStartWatching} size="lg" className="px-8">
            미리보기
          </Button>
        </div>
      )}

      {state === "WATCHING" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center gap-4 border bg-background rounded-lg p-6 md:p-8">
            <p className="text-lg font-medium">광고 시청 중</p>
            <p className="text-sm text-muted-foreground">
              Today&apos;s Tech는 광고 수익으로 운영됩니다. <br/>
              잠시만 기다려주세요!
            </p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            광고 종료까지 {secondsLeft}초
          </p>
        </div>
      )}

      {state === "UNLOCKED" && (
        <div className="flex flex-col gap-4 border bg-background rounded-lg p-6 md:p-8">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles width={16} height={16} />
              내일의 피드 미리 보기
            </p>
            <Link href={`/feed/${tomorrowDate}`} className="flex items-center gap-1.5 text-sm font-medium text-primary">
              전체보기
              <ChevronRight width={16} height={16} />
            </Link>
          </div>

          {tomorrowFeed ? (
            <TomorrowFeedCard feed={tomorrowFeed} tomorrowDate={tomorrowDate} />
          ) : (
            <p className="text-sm text-muted-foreground">
              내일 피드를 준비 중입니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
