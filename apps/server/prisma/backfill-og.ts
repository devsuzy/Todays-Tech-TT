import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { fetchOgImage } from '../src/lib/og'

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
