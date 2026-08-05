import express from 'express'
import type { Server } from 'node:http'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { runSlackNotify } from '../jobs/slack-notify'
import { prisma } from '../lib/prisma'
import router from './slack'

vi.mock('../lib/prisma', () => ({
  prisma: {
    slackSubscriber: { upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('../jobs/slack-notify', () => ({
  runSlackNotify: vi.fn(),
}))

describe('slack router', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    const app = express()
    app.use(express.json())
    app.use('/api/v1/slack', router)
    server = app.listen(0)
    await new Promise<void>((r) => server.once('listening', () => r()))
    const addr = server.address() as { port: number }
    baseUrl = `http://127.0.0.1:${addr.port}`
  })

  afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()))
  })

  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllEnvs())

  it('POST /subscribe는 슬랙 웹훅 URL을 구독 등록한다', async () => {
    vi.mocked(prisma.slackSubscriber.upsert).mockResolvedValue({ id: 1 } as any)

    const res = await fetch(`${baseUrl}/api/v1/slack/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/T/B/xxx' }),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('POST /subscribe는 활성 상태로 upsert를 호출한다', async () => {
    vi.mocked(prisma.slackSubscriber.upsert).mockResolvedValue({ id: 1 } as any)

    await fetch(`${baseUrl}/api/v1/slack/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/T/B/xxx' }),
    })
    expect(vi.mocked(prisma.slackSubscriber.upsert)).toHaveBeenCalledWith({
      where: { webhookUrl: 'https://hooks.slack.com/services/T/B/xxx' },
      create: { webhookUrl: 'https://hooks.slack.com/services/T/B/xxx', isActive: true },
      update: { isActive: true },
    })
  })

  it('POST /subscribe는 슬랙 도메인이 아니면 400을 반환한다', async () => {
    const res = await fetch(`${baseUrl}/api/v1/slack/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: 'https://evil.example.com/services/T/B/xxx' }),
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'INVALID_WEBHOOK_URL' })
  })

  it('POST /subscribe는 webhookUrl이 문자열이 아니면 400을 반환한다', async () => {
    const res = await fetch(`${baseUrl}/api/v1/slack/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: 123 }),
    })
    expect(res.status).toBe(400)
    expect(vi.mocked(prisma.slackSubscriber.upsert)).not.toHaveBeenCalled()
  })

  it('DELETE /unsubscribe는 구독자를 비활성화한다', async () => {
    vi.mocked(prisma.slackSubscriber.findUnique).mockResolvedValue({ id: 1 } as any)
    vi.mocked(prisma.slackSubscriber.update).mockResolvedValue({ id: 1 } as any)

    const res = await fetch(`${baseUrl}/api/v1/slack/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/T/B/xxx' }),
    })
    expect(res.status).toBe(200)
    expect(vi.mocked(prisma.slackSubscriber.update)).toHaveBeenCalledWith({
      where: { webhookUrl: 'https://hooks.slack.com/services/T/B/xxx' },
      data: { isActive: false },
    })
  })

  it('DELETE /unsubscribe는 구독자가 없으면 404를 반환한다', async () => {
    vi.mocked(prisma.slackSubscriber.findUnique).mockResolvedValue(null as any)

    const res = await fetch(`${baseUrl}/api/v1/slack/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/T/B/xxx' }),
    })
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'NOT_FOUND' })
  })

  it('DELETE /unsubscribe는 webhookUrl이 문자열이 아니면 400을 반환한다', async () => {
    const res = await fetch(`${baseUrl}/api/v1/slack/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'INVALID_WEBHOOK_URL' })
  })

  it('GET /oauth/start는 SLACK_CLIENT_ID가 없으면 500을 반환한다', async () => {
    vi.stubEnv('SLACK_CLIENT_ID', '')

    const res = await fetch(`${baseUrl}/api/v1/slack/oauth/start`, { redirect: 'manual' })
    expect(res.status).toBe(500)
  })

  it('GET /oauth/start는 슬랙 인증 페이지로 리다이렉트한다', async () => {
    vi.stubEnv('SLACK_CLIENT_ID', 'client-123')

    const res = await fetch(`${baseUrl}/api/v1/slack/oauth/start`, { redirect: 'manual' })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toMatch(
      /^https:\/\/slack\.com\/oauth\/v2\/authorize\?client_id=client-123/
    )
  })

  it('POST /send는 발송 결과를 200으로 반환한다', async () => {
    vi.mocked(runSlackNotify).mockResolvedValue({ sent: 3, failed: 0 } as any)

    const res = await fetch(`${baseUrl}/api/v1/slack/send`, { method: 'POST' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, sent: 3, failed: 0 })
  })

  it('POST /send는 발송이 실패하면 500을 반환한다', async () => {
    vi.mocked(runSlackNotify).mockRejectedValue(new Error('boom'))

    const res = await fetch(`${baseUrl}/api/v1/slack/send`, { method: 'POST' })
    const body = (await res.json()) as { ok: boolean }
    expect(res.status).toBe(500)
    expect(body.ok).toBe(false)
  })
})
