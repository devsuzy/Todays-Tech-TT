import 'dotenv/config'
import RssParser from 'rss-parser'
import { prisma } from '../lib/prisma'
import { fetchOgImage } from '../lib/og'

const parser = new RssParser()

export async function runCrawl() {
  console.log('[crawl] Starting RSS crawl...')
  const sources = await prisma.rssSource.findMany({ where: { isActive: true } })

  let newCount = 0
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.feedUrl)

      // 신규 아이템만 추려낸 뒤 ogImage fetch를 병렬 처리
      const newItems: typeof feed.items = []
      for (const item of feed.items) {
        const guid = item.guid ?? item.link ?? ''
        if (!guid) continue
        const existing = await prisma.article.findUnique({ where: { guid } })
        if (!existing) newItems.push(item)
      }

      if (newItems.length === 0) continue

      const ogImages = await Promise.all(
        newItems.map((item) => fetchOgImage(item.link ?? ''))
      )

      await Promise.all(
        newItems.map((item, i) =>
          prisma.article.create({
            data: {
              sourceId: source.id,
              guid: item.guid ?? item.link ?? '',
              title: item.title ?? '(제목 없음)',
              description: (item.contentSnippet ?? item.summary ?? '').slice(0, 500) || null,
              originalUrl: item.link ?? '',
              ogImage: ogImages[i],
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            },
          })
        )
      )
      newCount += newItems.length
    } catch (err) {
      console.error(`[crawl] Error fetching ${source.slug}:`, err)
    }
  }
  console.log(`[crawl] Done. New articles: ${newCount}`)
}

if (require.main === module) {
  runCrawl().finally(() => prisma.$disconnect())
}
