"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TomorrowFeedCard } from "@/components/Card/tomorrow-feed-card";
import { Progress } from "@/components/ui/progress";
import { usePreviewUnlock } from "@/hooks/use-preview-unlock";
import type { FeedDetail } from "@/types";
import { LockKeyhole, Sparkles, ChevronRight } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";

interface Props {
  tomorrowDate: string; // "YYYY-MM-DD"
}

export function TomorrowPreview({ tomorrowDate }: Props) {
  const { state, progress, secondsLeft, tomorrowFeed, startWatching } =
    usePreviewUnlock(tomorrowDate);

  return (
    <div className="border-accent rounded-lg bg-muted/20">
      {state === "LOCKED" && <LockedView onStart={startWatching} />}

      {state === "WATCHING" && (
        <WatchingView progress={progress} secondsLeft={secondsLeft} />
      )}

      {state === "UNLOCKED" && (
        <UnlockedView feed={tomorrowFeed} tomorrowDate={tomorrowDate} />
      )}
    </div>
  );
}

function LockedView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 md:gap-6 border border-accent bg-linear-to-b from-primary/30 to-white rounded-lg p-6 md:p-8">
      <div className="bg-background rounded-full p-4">
        <LockKeyhole className="text-primary" />
      </div>
      <p className="text-base font-medium md:text-lg">
        짧은 광고를 시청하면 <br/> 내일의 피드를 미리 볼 수 있어요.
      </p>
      <Button onClick={onStart} size="lg" className="px-8">
        미리보기
      </Button>
    </div>
  );
}

function WatchingView({
  progress,
  secondsLeft,
}: {
  progress: number;
  secondsLeft: number;
}) {
  return (
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
  );
}

function UnlockedView({
  feed,
  tomorrowDate,
}: {
  feed: FeedDetail | null;
  tomorrowDate: string;
}) {
  return (
    <div className="flex flex-col gap-4 border bg-background rounded-lg p-6 md:p-8">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Sparkles width={16} height={16} />
          내일의 피드 미리 보기
        </p>
        <Link href={`/feed/${tomorrowDate}`} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          전체보기
          <ChevronRight width={16} height={16} />
        </Link>
      </div>

      {feed ? (
        <TomorrowFeedCard feed={feed} tomorrowDate={tomorrowDate} />
      ) : (
        <div className="flex justify-center py-4 animate-pulse col-span-full">
          <ClipLoader color="#008080" />
        </div>
      )}
    </div>
  );
}
