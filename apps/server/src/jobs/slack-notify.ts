import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { getTodayKSTMidnightUTC } from '../lib/date'

function utcToKSTDateString(date: Date): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

type FeedWithRelations = Awaited<ReturnType<typeof fetchTodayFeed>>

async function fetchTodayFeed() {
  const todayUTC = getTodayKSTMidnightUTC()
  return prisma.feed.findFirst({
    where: { date: todayUTC, status: 'PUBLISHED' },
    include: {
      sections: { orderBy: { order: 'asc' } },
      article: { include: { source: true } },
    },
  })
}

function buildSlackMessage(feed: NonNullable<FeedWithRelations>, dateStr: string): object {
  const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'
  const feedUrl = `${siteUrl}/feed/${dateStr}`
  const title = feed.article?.title ?? '오늘의 피드'
  const sourceName = feed.article?.source?.name ?? ''
  const ogImage = feed.article?.ogImage ?? null

  const articleSection: Record<string, unknown> = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${title}*${sourceName ? `\n출처: ${sourceName}` : ''}`,
    },
  }
  if (ogImage) {
    articleSection.accessory = {
      type: 'image',
      image_url: ogImage,
      alt_text: 'thumbnail',
    }
  }

  const sectionBlocks = feed.sections.map((s) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${s.order}. *${s.title}*\n${s.body}`,
    },
  }))

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `📰 오늘의 Today's Tech (${dateStr})`, emoji: true },
      },
      articleSection,
      ...sectionBlocks,
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '전체 읽기', emoji: true },
            url: feedUrl,
            style: 'primary',
          },
        ],
      },
    ],
  }
}

export async function runSlackNotify() {
  console.log('[slack-notify] Starting...')

  const feed = await fetchTodayFeed()
  if (!feed) {
    console.log('[slack-notify] No PUBLISHED feed for today. Skipping.')
    return
  }

  const subscribers = await prisma.slackSubscriber.findMany({
    where: { isActive: true },
  })
  if (subscribers.length === 0) {
    console.log('[slack-notify] No active subscribers. Skipping.')
    return
  }

  const dateStr = utcToKSTDateString(feed.date)
  const message = buildSlackMessage(feed, dateStr)

  let successCount = 0
  for (const sub of subscribers) {
    try {
      const res = await fetch(sub.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
      if (res.ok) {
        successCount++
      } else {
        console.error(`[slack-notify] Failed (${res.status}) for subscriber id=${sub.id}`)
      }
    } catch (e) {
      console.error(`[slack-notify] Error for subscriber id=${sub.id}:`, e)
    }
  }

  console.log(`[slack-notify] Done. ${successCount}/${subscribers.length} sent.`)
}

if (require.main === module) {
  runSlackNotify().finally(() => prisma.$disconnect())
}
