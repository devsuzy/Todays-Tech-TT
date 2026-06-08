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
