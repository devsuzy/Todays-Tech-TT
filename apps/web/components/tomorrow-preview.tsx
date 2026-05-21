"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTomorrowFeed } from "@/lib/api";
import type { FeedDetail } from "@/types";

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
    <div className="border rounded-lg p-6 bg-muted/20">
      <h2 className="text-base font-semibold mb-4">내일 피드 미리보기</h2>

      {state === "LOCKED" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            짧은 광고를 시청하면 내일의 피드를 미리 볼 수 있어요.
          </p>
          <Button onClick={handleStartWatching} variant="outline">
            미리보기 👀
          </Button>
        </div>
      )}

      {state === "WATCHING" && (
        <div className="space-y-4">
          <div className="bg-background border rounded-md p-8 text-center">
            <p className="text-lg font-medium">광고 시청 중</p>
            <p className="text-sm text-muted-foreground mt-2">
              Today&apos;s Tech는 광고 수익으로 운영됩니다. 잠시만 기다려
              주세요!
            </p>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            광고 종료까지 {secondsLeft}초
          </p>
        </div>
      )}

      {state === "UNLOCKED" && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            ✓ 잠금 해제됨 · 자정에 정식 공개됩니다
          </p>
          {tomorrowFeed ? (
            <div className="space-y-3">
              {tomorrowFeed.sections.map((section) => (
                <div key={section.id} className="border-l-2 border-muted pl-3">
                  <p className="text-sm font-medium">
                    {section.order}. {section.title}
                  </p>
                </div>
              ))}
            </div>
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
