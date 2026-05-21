import 'dotenv/config'
import RssParser from 'rss-parser'
import { prisma } from '../lib/prisma'

const parser = new RssParser()

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TodaysTechBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

export async function runCrawl() {
  console.log('[crawl] Starting RSS crawl...')
  const sources = await prisma.rssSource.findMany({ where: { isActive: true } })

  let newCount = 0
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.feedUrl)
      for (const item of feed.items) {
        const guid = item.guid ?? item.link ?? ''
        if (!guid) continue

        const existing = await prisma.article.findUnique({ where: { guid } })
        if (existing) continue

        const originalUrl = item.link ?? ''
        const ogImage = await fetchOgImage(originalUrl)

        await prisma.article.create({
          data: {
            sourceId: source.id,
            guid,
            title: item.title ?? '(제목 없음)',
            originalUrl,
            ogImage,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
        })
        newCount++
      }
    } catch (err) {
      console.error(`[crawl] Error fetching ${source.slug}:`, err)
    }
  }
  console.log(`[crawl] Done. New articles: ${newCount}`)
}

if (require.main === module) {
  runCrawl().finally(() => prisma.$disconnect())
}
