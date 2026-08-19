import { Router } from 'express'
import type { Request } from 'express'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../lib/async-handler'
import { runSlackNotify } from '../jobs/slack-notify'

const router = Router()

const SLACK_WEBHOOK_PREFIX = 'https://hooks.slack.com/services/'

/** OAuth CSRF 방어용 state — start 에서 발급한 nonce 를 쿠키에 심고 callback 에서 대조한다 */
const STATE_COOKIE = 'slack_oauth_state'
const STATE_COOKIE_PATH = '/api/v1/slack'
const STATE_MAX_AGE_MS = 10 * 60 * 1000

// 상수가 아니라 함수 — SERVER_URL 을 모듈 로드 시점이 아니라 요청 시점에 읽어야 한다
const oauthRedirectUri = () =>
  `${process.env.SERVER_URL ?? 'http://localhost:4000'}/api/v1/slack/oauth/callback`

function isSlackWebhookUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(SLACK_WEBHOOK_PREFIX)
}

function readStateCookie(req: Request): string | null {
  const raw = req.headers.cookie
  if (!raw) return null
  for (const part of raw.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === STATE_COOKIE) return decodeURIComponent(rest.join('='))
  }
  return null
}

function matchesState(issued: string | null, returned: unknown): boolean {
  if (!issued || typeof returned !== 'string') return false
  if (issued.length !== returned.length) return false
  return timingSafeEqual(Buffer.from(issued), Buffer.from(returned))
}

/** 신규 등록과 재구독 모두 isActive: true 로 맞춘다 */
function activateSubscriber(webhookUrl: string) {
  return prisma.slackSubscriber.upsert({
    where: { webhookUrl },
    create: { webhookUrl, isActive: true },
    update: { isActive: true },
  })
}

/** OAuth 연결 직후 해당 채널로 보내는 환영 메시지 */
function buildWelcomeMessage() {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Today's Tech 알림 봇 설치 완료* 🎉\n매일 아침 9시, 오늘의 기술 트렌드를 이 채널로 보내드릴게요.\n\n<${process.env.SITE_URL ?? 'http://localhost:3000'}|Today's Tech>`,
        },
      },
    ],
  }
}

// POST /api/v1/slack/subscribe
router.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const { webhookUrl } = req.body
    if (!isSlackWebhookUrl(webhookUrl)) {
      return res.status(400).json({ error: 'INVALID_WEBHOOK_URL' })
    }

    await activateSubscriber(webhookUrl)

    res.json({ ok: true })
  }),
)

// DELETE /api/v1/slack/unsubscribe
router.delete(
  '/unsubscribe',
  asyncHandler(async (req, res) => {
    const { webhookUrl } = req.body
    if (typeof webhookUrl !== 'string') {
      return res.status(400).json({ error: 'INVALID_WEBHOOK_URL' })
    }

    const subscriber = await prisma.slackSubscriber.findUnique({ where: { webhookUrl } })
    if (!subscriber) {
      return res.status(404).json({ error: 'NOT_FOUND' })
    }

    await prisma.slackSubscriber.update({
      where: { webhookUrl },
      data: { isActive: false },
    })

    res.json({ ok: true })
  }),
)

// GET /api/v1/slack/oauth/start — Slack OAuth 시작 (클라이언트 ID를 서버에서 처리)
router.get('/oauth/start', (_req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID

  if (!clientId) {
    return res.status(500).json({ error: 'SLACK_CLIENT_ID not configured' })
  }

  const redirectUri = oauthRedirectUri()
  const state = randomBytes(16).toString('base64url')

  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    // 슬랙 → 서버 리다이렉트는 top-level GET 이라 SameSite=Lax 로도 쿠키가 실려온다
    sameSite: 'lax',
    secure: redirectUri.startsWith('https://'),
    maxAge: STATE_MAX_AGE_MS,
    path: STATE_COOKIE_PATH,
  })

  res.redirect(
    `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=incoming-webhook&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
  )
})

// GET /api/v1/slack/oauth/callback — Slack OAuth 인증 콜백
router.get('/oauth/callback', async (req, res) => {
  const { code, error, state } = req.query
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000'
  const issuedState = readStateCookie(req)

  // 실패 사유를 웹으로 그대로 넘겨야 사용자가 무엇 때문에 막혔는지 알 수 있다
  // (예: invalid_team_for_non_distributed_app = 앱이 아직 공개 배포되지 않음)
  const fail = (reason: string) =>
    res.redirect(`${webOrigin}/archive?slack=error&reason=${encodeURIComponent(reason)}`)

  res.clearCookie(STATE_COOKIE, { path: STATE_COOKIE_PATH })

  if (typeof error === 'string' && error) {
    console.error('[slack-oauth] Authorization rejected:', error)
    return fail(error)
  }

  if (typeof code !== 'string' || !code) {
    console.error('[slack-oauth] Missing code')
    return fail('missing_code')
  }

  if (!matchesState(issuedState, state)) {
    console.error('[slack-oauth] State mismatch')
    return fail('invalid_state')
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: process.env.SLACK_CLIENT_ID ?? '',
      client_secret: process.env.SLACK_CLIENT_SECRET ?? '',
      redirect_uri: oauthRedirectUri(),
    })

    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = (await tokenRes.json()) as {
      ok: boolean
      error?: string
      incoming_webhook?: { url: string; channel: string }
    }

    if (!data.ok || !data.incoming_webhook?.url) {
      console.error('[slack-oauth] Token exchange failed:', data.error)
      return fail(data.error ?? 'token_exchange_failed')
    }

    await activateSubscriber(data.incoming_webhook.url)

    console.log(`[slack-oauth] Connected: ${data.incoming_webhook.channel}`)

    fetch(data.incoming_webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildWelcomeMessage()),
    }).catch((e) => console.error('[slack-oauth] Welcome message failed:', e))

    res.redirect(`${webOrigin}/archive?slack=connected`)
  } catch (err) {
    console.error('[slack-oauth] Error:', err)
    return fail('unexpected_error')
  }
})

// POST /api/v1/slack/send — 수동 발송 트리거
router.post('/send', async (_req, res) => {
  try {
    const result = await runSlackNotify()
    res.json({ ok: true, ...(result ?? { sent: 0, failed: 0 }) })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) })
  }
})

export default router
