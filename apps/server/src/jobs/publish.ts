import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { getTodayKSTMidnightUTC } from '../lib/date'

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
  }
}

if (require.main === module) {
  runPublish().finally(() => prisma.$disconnect())
}
