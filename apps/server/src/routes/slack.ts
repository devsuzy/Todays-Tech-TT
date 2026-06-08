import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { runSlackNotify } from '../jobs/slack-notify'

const router = Router()

// POST /api/v1/slack/subscribe
router.post('/subscribe', async (req, res) => {
  const { webhookUrl } = req.body
  if (
    typeof webhookUrl !== 'string' ||
    !webhookUrl.startsWith('https://hooks.slack.com/services/')
  ) {
    return res.status(400).json({ error: 'INVALID_WEBHOOK_URL' })
  }

  await prisma.slackSubscriber.upsert({
    where: { webhookUrl },
    create: { webhookUrl, isActive: true },
    update: { isActive: true },
  })

  res.json({ ok: true })
})

// DELETE /api/v1/slack/unsubscribe
router.delete('/unsubscribe', async (req, res) => {
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
})

// GET /api/v1/slack/oauth/callback — Slack OAuth 인증 콜백
router.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000'
  const serverUrl = process.env.SERVER_URL ?? 'http://localhost:4000'

  if (error || typeof code !== 'string') {
    return res.redirect(`${webOrigin}/archive?slack=error`)
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: process.env.SLACK_CLIENT_ID ?? '',
      client_secret: process.env.SLACK_CLIENT_SECRET ?? '',
      redirect_uri: `${serverUrl}/api/v1/slack/oauth/callback`,
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
      return res.redirect(`${webOrigin}/archive?slack=error`)
    }

    await prisma.slackSubscriber.upsert({
      where: { webhookUrl: data.incoming_webhook.url },
      create: { webhookUrl: data.incoming_webhook.url, isActive: true },
      update: { isActive: true },
    })

    console.log(`[slack-oauth] Connected: ${data.incoming_webhook.channel}`)
    res.redirect(`${webOrigin}/archive?slack=connected`)
  } catch (err) {
    console.error('[slack-oauth] Error:', err)
    res.redirect(`${webOrigin}/archive?slack=error`)
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
