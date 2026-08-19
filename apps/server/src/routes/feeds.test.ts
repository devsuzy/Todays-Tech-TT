import express from 'express'
import type { Server } from 'node:http'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../lib/prisma'
import router from './feeds'

vi.mock('../lib/prisma', () => ({
  prisma: {
    feed: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}))

describe('feeds router', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    const app = express()
    app.use(express.json())
    app.use('/api/v1/feeds', router)
    server = app.listen(0)
    await new Promise<void>((r) => server.once('listening', () => r()))
    const addr = server.address() as { port: number }
    baseUrl = `http://127.0.0.1:${addr.port}`
  })

  afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()))
  })

  beforeEach(() => vi.clearAllMocks())

  it('GET /는 PUBLISHED 피드 목록을 200으로 반환한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([
      { id: 1, date: new Date('2026-05-20T15:00:00.000Z'), status: 'PUBLISHED' },
    ] as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([
      { id: 1, date: '2026-05-20T15:00:00.000Z', status: 'PUBLISHED' },
    ])
  })

  it('GET /?tag=react는 태그 슬러그로 필터링한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds?tag=react`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.where.tags.some.tag.slug).toBe('react')
  })

  // 목록/검색이 공유하는 include — take:1 이나 select 필드가 빠지면 카드가 조용히 깨진다
  const LIST_INCLUDE = {
    sections: { orderBy: { order: 'asc' }, take: 1 },
    tags: { include: { tag: true } },
    article: { select: { ogImage: true, source: { select: { name: true } } } },
  }

  it('GET /는 목록용 include 형태로 조회한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.include).toEqual(LIST_INCLUDE)
  })

  it('GET /search는 목록과 동일한 include 형태로 조회한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds/search?q=react`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.include).toEqual(LIST_INCLUDE)
  })

  it('파라미터가 없으면 skip 0, take 20을 기본값으로 쓴다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.skip).toBe(0)
    expect(arg.take).toBe(20)
  })

  it('limit이 100을 넘으면 100으로 제한한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds?limit=999`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.take).toBe(100)
  })

  it('limit이 0이면 1로 올린다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds?limit=0`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.take).toBe(1)
  })

  it('skip이 음수면 0으로 올린다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds?skip=-5`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(arg.skip).toBe(0)
  })

  it('GET /today는 피드가 있으면 200으로 반환한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue({ id: 7, status: 'PUBLISHED' } as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/today`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 7, status: 'PUBLISHED' })
  })

  it('GET /today는 피드가 없으면 404 NOT_FOUND를 반환한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue(null as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/today`)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'NOT_FOUND' })
  })

  it('GET /tomorrow는 DRAFT 피드가 있으면 200으로 반환한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue({ id: 9, status: 'DRAFT' } as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/tomorrow`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 9, status: 'DRAFT' })
  })

  it('GET /tomorrow는 /today보다 하루 뒤 UTC 자정으로 조회한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue(null as any)

    await fetch(`${baseUrl}/api/v1/feeds/today`)
    await fetch(`${baseUrl}/api/v1/feeds/tomorrow`)
    const [todayArg, tomorrowArg] = vi.mocked(prisma.feed.findUnique).mock.calls.map(
      (c) => c[0] as any
    )
    expect(tomorrowArg.where.date.getTime() - todayArg.where.date.getTime()).toBe(86400000)
  })

  it('GET /tomorrow는 피드가 없으면 404 NOT_FOUND를 반환한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue(null as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/tomorrow`)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'NOT_FOUND' })
  })

  it('GET /search는 q가 없으면 400 MISSING_QUERY를 반환한다', async () => {
    const res = await fetch(`${baseUrl}/api/v1/feeds/search`)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'MISSING_QUERY' })
  })

  it('GET /search는 q가 공백뿐이면 400 MISSING_QUERY를 반환한다', async () => {
    const res = await fetch(`${baseUrl}/api/v1/feeds/search?q=%20%20`)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'MISSING_QUERY' })
  })

  it('GET /search?q=react는 대소문자 무시 contains로 조회한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/search?q=react`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(res.status).toBe(200)
    expect(arg.where.sections.some.title).toEqual({ contains: 'react', mode: 'insensitive' })
  })

  it('GET /search는 조회가 실패하면 500 INTERNAL_ERROR를 반환한다', async () => {
    vi.mocked(prisma.feed.findMany).mockRejectedValue(new Error('db down'))

    const res = await fetch(`${baseUrl}/api/v1/feeds/search?q=x`)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'INTERNAL_ERROR' })
  })

  it('GET /dates는 발행된 피드의 날짜와 수정시각만 조회한다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([
      { date: new Date('2026-05-20T15:00:00.000Z'), updatedAt: new Date('2026-05-21T00:00:00.000Z') },
    ] as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/dates`)
    const arg = vi.mocked(prisma.feed.findMany).mock.calls[0][0] as any
    expect(res.status).toBe(200)
    expect(arg).toEqual({
      where: { status: 'PUBLISHED' },
      select: { date: true, updatedAt: true },
      orderBy: { date: 'desc' },
    })
  })

  it('GET /dates는 /:date보다 먼저 등록되어 상세 조회로 새지 않는다', async () => {
    vi.mocked(prisma.feed.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/feeds/dates`)
    expect(vi.mocked(prisma.feed.findUnique)).not.toHaveBeenCalled()
  })

  it('GET /:date는 KST 날짜를 UTC 자정으로 변환해 조회한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue({ id: 3 } as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/2026-05-21`)
    const arg = vi.mocked(prisma.feed.findUnique).mock.calls[0][0] as any
    expect(res.status).toBe(200)
    expect(arg.where.date.toISOString()).toBe('2026-05-20T15:00:00.000Z')
  })

  it('GET /:date는 해당 날짜 피드가 없으면 404 NOT_FOUND를 반환한다', async () => {
    vi.mocked(prisma.feed.findUnique).mockResolvedValue(null as any)

    const res = await fetch(`${baseUrl}/api/v1/feeds/2026-05-21`)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'NOT_FOUND' })
  })
})
