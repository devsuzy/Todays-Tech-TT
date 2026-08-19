import type { FeedDate, FeedDetail, FeedListItem, Tag } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

const REVALIDATE_1H: RequestInit = { next: { revalidate: 3600 } }
const REVALIDATE_1D: RequestInit = { next: { revalidate: 86400 } }
const NO_STORE: RequestInit = { cache: 'no-store' }

async function fetchJson<T>(
  path: string,
  init: RequestInit,
  fallback: T
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init)
    if (!res.ok) return fallback
    return res.json()
  } catch {
    return fallback
  }
}

export async function getFeeds(
  tag?: string,
  skip = 0,
  limit = 20
): Promise<FeedListItem[]> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
  if (tag) params.set('tag', tag)
  // 첫 페이지만 ISR 캐시, 무한 스크롤로 이어 받는 페이지는 캐시하지 않음
  const init = skip === 0 ? REVALIDATE_1H : NO_STORE
  return fetchJson<FeedListItem[]>(`/api/v1/feeds?${params}`, init, [])
}

export async function getFeed(date: string): Promise<FeedDetail | null> {
  return fetchJson<FeedDetail | null>(`/api/v1/feeds/${date}`, REVALIDATE_1H, null)
}

export async function getTags(): Promise<Tag[]> {
  return fetchJson<Tag[]>('/api/v1/tags', REVALIDATE_1D, [])
}

// 사이트맵용 — 발행된 피드의 날짜/수정시각만 받아온다
export async function getFeedDates(): Promise<FeedDate[]> {
  return fetchJson<FeedDate[]>('/api/v1/feeds/dates', REVALIDATE_1H, [])
}

export async function searchFeeds(q: string): Promise<FeedListItem[]> {
  return fetchJson<FeedListItem[]>(
    `/api/v1/feeds/search?q=${encodeURIComponent(q)}`,
    NO_STORE,
    []
  )
}

export async function getTomorrowFeed(): Promise<FeedDetail | null> {
  return fetchJson<FeedDetail | null>('/api/v1/feeds/tomorrow', NO_STORE, null)
}
