import { prisma } from '../lib/prisma'
import { getTodayKSTMidnightUTC } from '../lib/date'
import { runCrawl } from './crawl'
import { runSummarize } from './summarize'
import { runPublish } from './publish'

export async function runCatchUpIfNeeded() {
  const todayUTC = getTodayKSTMidnightUTC()
  const existing = await prisma.feed.findFirst({
    where: { date: todayUTC, status: 'PUBLISHED' },
  })

  if (existing) {
    console.log('[catchup] Today\'s feed already exists. Skipping.')
    return
  }

  console.log('[catchup] No feed for today. Running catch-up pipeline...')
  await runCrawl()
  await runSummarize(todayUTC)
  await runPublish()
  console.log('[catchup] Done.')
}
