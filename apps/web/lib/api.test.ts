import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getFeed,
  getFeeds,
  getTags,
  getTomorrowFeed,
  searchFeeds,
} from '@/lib/api'

const mockOk = (data: unknown) => ({ ok: true, json: async () => data })
const mockFail = () => ({ ok: false, json: async () => ({}) })

describe('api', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('getFeeds는 기본 skip/limit 쿼리로 호출하고 응답을 그대로 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([{ id: 1 }]) as unknown as Response)
    const result = await getFeeds()
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/api/v1/feeds?skip=0&limit=20')
    expect(result).toEqual([{ id: 1 }])
  })

  it('getFeeds는 tag/skip/limit을 쿼리에 담는다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([]) as unknown as Response)
    await getFeeds('react', 20, 10)
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('skip=20&limit=10&tag=react')
  })

  it('getFeeds는 skip이 0이면 1시간 ISR 옵션을 쓴다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([]) as unknown as Response)
    await getFeeds()
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ next: { revalidate: 3600 } })
  })

  it('getFeeds는 skip이 0이 아니면 캐시를 쓰지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([]) as unknown as Response)
    await getFeeds(undefined, 20)
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ cache: 'no-store' })
  })

  it('getFeeds는 응답이 실패하면 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFail() as unknown as Response)
    expect(await getFeeds()).toEqual([])
  })

  it('getFeeds는 fetch가 throw하면 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    expect(await getFeeds()).toEqual([])
  })

  it('getFeed는 날짜 경로로 호출하고 피드를 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk({ id: 7 }) as unknown as Response)
    const result = await getFeed('2026-05-21')
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/api/v1/feeds/2026-05-21')
    expect(result).toEqual({ id: 7 })
  })

  it('getFeed는 1시간 ISR 옵션을 쓴다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk({ id: 7 }) as unknown as Response)
    await getFeed('2026-05-21')
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ next: { revalidate: 3600 } })
  })

  it('getFeed는 응답이 실패하면 null을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFail() as unknown as Response)
    expect(await getFeed('2026-05-21')).toBeNull()
  })

  it('getFeed는 fetch가 throw하면 null을 반환한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    expect(await getFeed('2026-05-21')).toBeNull()
  })

  it('getTags는 태그 배열을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([{ id: 1, name: 'AI' }]) as unknown as Response)
    const result = await getTags()
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/api/v1/tags')
    expect(result).toEqual([{ id: 1, name: 'AI' }])
  })

  it('getTags는 1일 ISR 옵션을 쓴다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([]) as unknown as Response)
    await getTags()
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ next: { revalidate: 86400 } })
  })

  it('getTags는 응답이 실패하면 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFail() as unknown as Response)
    expect(await getTags()).toEqual([])
  })

  it('getTags는 fetch가 throw하면 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    expect(await getTags()).toEqual([])
  })

  it('searchFeeds는 검색어를 URL 인코딩해서 호출한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([]) as unknown as Response)
    await searchFeeds('a b&c')
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/api/v1/feeds/search?q=a%20b%26c')
  })

  it('searchFeeds는 캐시를 쓰지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk([]) as unknown as Response)
    await searchFeeds('react')
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ cache: 'no-store' })
  })

  it('searchFeeds는 응답이 실패하면 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFail() as unknown as Response)
    expect(await searchFeeds('react')).toEqual([])
  })

  it('searchFeeds는 fetch가 throw하면 빈 배열을 반환한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    expect(await searchFeeds('react')).toEqual([])
  })

  it('getTomorrowFeed는 내일 피드를 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk({ id: 9 }) as unknown as Response)
    const result = await getTomorrowFeed()
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/api/v1/feeds/tomorrow')
    expect(result).toEqual({ id: 9 })
  })

  it('getTomorrowFeed는 캐시를 쓰지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOk({ id: 9 }) as unknown as Response)
    await getTomorrowFeed()
    expect(vi.mocked(fetch).mock.calls[0][1]).toEqual({ cache: 'no-store' })
  })

  it('getTomorrowFeed는 응답이 실패하면 null을 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFail() as unknown as Response)
    expect(await getTomorrowFeed()).toBeNull()
  })

  it('getTomorrowFeed는 fetch가 throw하면 null을 반환한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'))
    expect(await getTomorrowFeed()).toBeNull()
  })
})
