"use client";

import { useState, useEffect, useRef } from "react";
import { getTomorrowFeed } from "@/lib/api";
import { getKSTMidnightUTC } from "@/lib/date-utils";
import type { FeedDetail } from "@/types";

export type PreviewState = "LOCKED" | "WATCHING" | "UNLOCKED";

type PreviewToken = {
  unlockedAt: string;
  expiresAt: string;
};

const AD_DURATION_MS = 5000;
const TICK_MS = 100;

function getStorageKey(date: string) {
  return `tt_preview_${date}`;
}

// 유효한 토큰이면 true, 만료·손상된 토큰이면 지우고 false
function hasValidToken(key: string) {
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  try {
    const token = JSON.parse(raw) as PreviewToken;
    if (new Date(token.expiresAt) > new Date()) return true;
  } catch {
    // 파싱 실패 시에도 아래에서 정리
  }
  localStorage.removeItem(key);
  return false;
}

export function usePreviewUnlock(tomorrowDate: string) {
  const [state, setState] = useState<PreviewState>("LOCKED");
  const [progress, setProgress] = useState(0);
  const [tomorrowFeed, setTomorrowFeed] = useState<FeedDetail | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasValidToken(getStorageKey(tomorrowDate))) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState("UNLOCKED");
    getTomorrowFeed().then(setTomorrowFeed);
  }, [tomorrowDate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function unlock() {
    const token: PreviewToken = {
      unlockedAt: new Date().toISOString(),
      expiresAt: getKSTMidnightUTC(tomorrowDate).toISOString(),
    };
    localStorage.setItem(getStorageKey(tomorrowDate), JSON.stringify(token));
    setState("UNLOCKED");
    getTomorrowFeed().then(setTomorrowFeed);
  }

  function startWatching() {
    setState("WATCHING");
    setProgress(0);
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += TICK_MS;
      setProgress(Math.min((elapsed / AD_DURATION_MS) * 100, 100));
      if (elapsed >= AD_DURATION_MS) {
        clearInterval(intervalRef.current!);
        unlock();
      }
    }, TICK_MS);
  }

  const secondsLeft = Math.ceil(
    (AD_DURATION_MS - (progress / 100) * AD_DURATION_MS) / 1000
  );

  return { state, progress, secondsLeft, tomorrowFeed, startWatching };
}
