import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { getTodayKSTMidnightUTC } from '../lib/date'

async function triggerRevalidation() {
  const webUrl = process.env.WEB_ORIGIN
  const secret = process.env.REVALIDATE_SECRET
  if (!webUrl || !secret) return

  try {
    const res = await fetch(`${webUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    if (res.ok) {
      console.log('[publish] Vercel cache revalidated.')
    } else {
      console.warn('[publish] Revalidation failed:', res.status)
    }
  } catch (e) {
    console.warn('[publish] Revalidation request error:', e)
  }
}

export async function runPublish() {
  console.log('[publish] Starting...')
  const todayUTC = getTodayKSTMidnightUTC()

  const result = await prisma.feed.updateMany({
    where: { date: todayUTC, status: 'DRAFT' },
    data: { status: 'PUBLISHED' },
  })

  if (result.count === 0) {
    console.log('[publish] No DRAFT feed found for today.')
  } else {
    console.log(`[publish] Published ${result.count} feed(s) for ${todayUTC.toISOString().slice(0, 10)}`)
    await triggerRevalidation()
  }
}

if (require.main === module) {
  runPublish().finally(() => prisma.$disconnect())
}
