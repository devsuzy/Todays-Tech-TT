import { Router } from 'express'
import type { Response } from 'express'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../lib/async-handler'
import { getTodayKSTMidnightUTC, getTomorrowKSTMidnightUTC, dateStringToKSTMidnightUTC } from '../lib/date'

const router = Router()

// 상세 응답: 섹션 전체 + 아티클/출처 전체
const FEED_INCLUDE = {
  sections: { orderBy: { order: 'asc' as const } },
  tags: { include: { tag: true } },
  article: { include: { source: true } },
}

// 목록·검색 응답: 카드 렌더에 필요한 첫 섹션과 최소 필드만
const FEED_LIST_INCLUDE = {
  sections: { orderBy: { order: 'asc' as const }, take: 1 },
  tags: { include: { tag: true } },
  article: { select: { ogImage: true, source: { select: { name: true } } } },
}

/** 해당 UTC 자정 날짜의 피드 상세를 응답한다. 없으면 404. */
async function respondFeedByDate(res: Response, dateUTC: Date) {
  const feed = await prisma.feed.findUnique({
    where: { date: dateUTC },
    include: FEED_INCLUDE,
  })

  if (!feed) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json(feed)
}

// GET /api/v1/feeds — 아카이브 목록 (?tag=react&skip=0&limit=20)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const tag = req.query.tag as string | undefined
    const skip = Math.max(0, parseInt(req.query.skip as string ?? '0', 10))
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string ?? '20', 10)))

    const feeds = await prisma.feed.findMany({
      where: {
        status: 'PUBLISHED',
        ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
      },
      include: FEED_LIST_INCLUDE,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    })

    res.json(feeds)
  }),
)

// GET /api/v1/feeds/tomorrow — 내일 피드 (DRAFT, 미리보기용)
router.get(
  '/tomorrow',
  asyncHandler((_req, res) => respondFeedByDate(res, getTomorrowKSTMidnightUTC())),
)

// GET /api/v1/feeds/today — 오늘 피드
router.get(
  '/today',
  asyncHandler((_req, res) => respondFeedByDate(res, getTodayKSTMidnightUTC())),
)

// GET /api/v1/feeds/search?q=... — 타이틀 기반 검색
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string)?.trim()
    if (!q) return res.status(400).json({ error: 'MISSING_QUERY' })

    const feeds = await prisma.feed.findMany({
      where: {
        status: 'PUBLISHED',
        sections: { some: { title: { contains: q, mode: 'insensitive' } } },
      },
      include: FEED_LIST_INCLUDE,
      orderBy: { date: 'desc' },
      take: 20,
    })

    res.json(feeds)
  }),
)

// GET /api/v1/feeds/:date — 날짜별 피드 상세 (YYYY-MM-DD)
router.get(
  '/:date',
  asyncHandler((req, res) => respondFeedByDate(res, dateStringToKSTMidnightUTC(req.params.date))),
)

export default router
