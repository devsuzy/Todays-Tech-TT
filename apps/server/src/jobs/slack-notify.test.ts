import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findMany: vi.fn(),
}))

vi.mock('../lib/prisma', () => ({
  prisma: {
    feed: { findFirst: mocks.findFirst },
    slackSubscriber: { findMany: mocks.findMany },
    $disconnect: vi.fn(),
  },
}))

import { runSlackNotify } from './slack-notify'

const fetchMock = vi.fn()

const feed = {
  id: 1,
  date: new Date('2026-05-20T15:00:00.000Z'),
  sections: [
    { order: 1, title: '첫 번째 섹션' },
    { order: 2, title: '두 번째 섹션' },
  ],
  article: { title: 'AI 코드 리뷰', ogImage: null, source: { name: 'Tech Blog' } },
}

const subscribers = [
  { id: 1, webhookUrl: 'https://hooks.slack.com/services/a' },
  { id: 2, webhookUrl: 'https://hooks.slack.com/services/b' },
]

describe('runSlackNotify', () => {
  beforeEach(() => {
    mocks.findFirst.mockReset()
    mocks.findMany.mockReset()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('SITE_URL', 'https://todays-tech.dev')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('오늘 PUBLISHED 피드가 없으면 전송하지 않는다', async () => {
    mocks.findFirst.mockResolvedValue(null)
    expect(await runSlackNotify()).toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('활성 구독자가 없으면 전송하지 않는다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue([])
    expect(await runSlackNotify()).toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('구독자 전원에게 전송하면 sent를 집계한다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue(subscribers)
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    expect(await runSlackNotify()).toEqual({ sent: 2, failed: 0 })
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      'https://hooks.slack.com/services/a',
      'https://hooks.slack.com/services/b',
    ])
  })

  it('일부 응답이 실패하면 failed를 집계한다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue(subscribers)
    fetchMock
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({ ok: false, status: 500 })
    expect(await runSlackNotify()).toEqual({ sent: 1, failed: 1 })
  })

  it('헤더 블록에 피드의 KST 날짜가 들어간다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue([subscribers[0]])
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    await runSlackNotify()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.blocks[0].type).toBe('header')
    expect(body.blocks[0].text.text).toContain('2026-05-21')
  })

  it('본문 블록에 아티클 제목과 섹션 목록이 들어간다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue([subscribers[0]])
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    await runSlackNotify()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.blocks[1].text.text).toContain('AI 코드 리뷰')
    expect(body.blocks[1].text.text).toContain('1. *첫 번째 섹션*\n2. *두 번째 섹션*')
  })

  it('액션 블록에 해당 날짜의 피드 링크를 넣는다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue([subscribers[0]])
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    await runSlackNotify()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.blocks[2].type).toBe('actions')
    expect(body.blocks[2].elements[0].url).toBe('https://todays-tech.dev/feed/2026-05-21')
  })

  it('ogImage가 있으면 본문 블록에 이미지 accessory를 붙인다', async () => {
    mocks.findFirst.mockResolvedValue({
      ...feed,
      article: { ...feed.article, ogImage: 'https://cdn.example.com/og.png' },
    })
    mocks.findMany.mockResolvedValue([subscribers[0]])
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    await runSlackNotify()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.blocks[1].accessory.type).toBe('image')
    expect(body.blocks[1].accessory.image_url).toBe('https://cdn.example.com/og.png')
  })

  it('ogImage가 없으면 accessory를 붙이지 않는다', async () => {
    mocks.findFirst.mockResolvedValue(feed)
    mocks.findMany.mockResolvedValue([subscribers[0]])
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    await runSlackNotify()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.blocks[1].accessory).toBeUndefined()
  })
})
