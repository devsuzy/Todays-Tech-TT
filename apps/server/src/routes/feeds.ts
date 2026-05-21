import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { getTodayKSTMidnightUTC, getTomorrowKSTMidnightUTC, dateStringToKSTMidnightUTC } from '../lib/date'

const router = Router()

const FEED_INCLUDE = {
  sections: { orderBy: { order: 'asc' as const } },
  tags: { include: { tag: true } },
  article: { include: { source: true } },
}

// GET /api/v1/feeds — 아카이브 목록 (?tag=react)
router.get('/', async (req, res) => {
  const tag = req.query.tag as string | undefined

  const feeds = await prisma.feed.findMany({
    where: {
      status: 'PUBLISHED',
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    },
    include: {
      sections: { orderBy: { order: 'asc' }, take: 1 },
      tags: { include: { tag: true } },
      article: { select: { ogImage: true } },
    },
    orderBy: { date: 'desc' },
  })

  res.json(feeds)
})

// GET /api/v1/feeds/tomorrow — 내일 피드 (DRAFT, 미리보기용)
router.get('/tomorrow', async (req, res) => {
  const tomorrowUTC = getTomorrowKSTMidnightUTC()
  const feed = await prisma.feed.findUnique({
    where: { date: tomorrowUTC },
    include: FEED_INCLUDE,
  })

  if (!feed) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json(feed)
})

// GET /api/v1/feeds/today — 오늘 피드
router.get('/today', async (req, res) => {
  const todayUTC = getTodayKSTMidnightUTC()
  const feed = await prisma.feed.findUnique({
    where: { date: todayUTC },
    include: FEED_INCLUDE,
  })

  if (!feed) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json(feed)
})

// GET /api/v1/feeds/:date — 날짜별 피드 상세 (YYYY-MM-DD)
router.get('/:date', async (req, res) => {
  const dateUTC = dateStringToKSTMidnightUTC(req.params.date)
  const feed = await prisma.feed.findUnique({
    where: { date: dateUTC },
    include: FEED_INCLUDE,
  })

  if (!feed) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json(feed)
})

export default router
