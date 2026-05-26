import type { FeedDetail, FeedListItem, Tag } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export async function getFeeds(tag?: string): Promise<FeedListItem[]> {
  const url = tag
    ? `${API_BASE}/api/v1/feeds?tag=${encodeURIComponent(tag)}`
    : `${API_BASE}/api/v1/feeds`
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getFeed(date: string): Promise<FeedDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feeds/${date}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/tags`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function searchFeeds(q: string): Promise<FeedListItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/feeds/search?q=${encodeURIComponent(q)}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getTomorrowFeed(): Promise<FeedDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feeds/tomorrow`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
