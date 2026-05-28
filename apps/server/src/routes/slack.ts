import { Router } from 'express'
import { prisma } from '../lib/prisma'

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

export default router
