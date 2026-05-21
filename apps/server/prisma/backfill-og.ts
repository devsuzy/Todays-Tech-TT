import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TodaysTechBot/1.0)' },
      signal: AbortSignal.timeout(8000),
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

async function main() {
  const articles = await prisma.article.findMany({
    where: { ogImage: null, feed: { isNot: null } },
  })
  console.log(`Backfilling ${articles.length} articles...`)
  for (const a of articles) {
    const og = await fetchOgImage(a.originalUrl)
    await prisma.article.update({ where: { id: a.id }, data: { ogImage: og } })
    console.log(`  id=${a.id} → ${og ?? '(none)'}`)
  }
}

main().finally(() => prisma.$disconnect())
