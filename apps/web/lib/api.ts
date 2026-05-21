import type { FeedDetail, FeedListItem, Tag } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export async function getFeeds(tag?: string): Promise<FeedListItem[]> {
  const url = tag
    ? `${API_BASE}/api/v1/feeds?tag=${encodeURIComponent(tag)}`
    : `${API_BASE}/api/v1/feeds`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return res.json()
}

export async function getFeed(date: string): Promise<FeedDetail | null> {
  const res = await fetch(`${API_BASE}/api/v1/feeds/${date}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${API_BASE}/api/v1/tags`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) return []
  return res.json()
}

export async function getTomorrowFeed(): Promise<FeedDetail | null> {
  const res = await fetch(`${API_BASE}/api/v1/feeds/tomorrow`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}
