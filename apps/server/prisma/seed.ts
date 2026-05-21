import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // RSS Sources
  const rssSources = [
    { name: 'Toss Tech',     slug: 'toss-tech',   feedUrl: 'https://toss.tech/rss.xml',                       homeUrl: 'https://toss.tech' },
    { name: '당근마켓 Tech', slug: 'daangn-tech', feedUrl: 'https://medium.com/feed/daangn',                  homeUrl: 'https://medium.com/daangn' },
    { name: '우아한형제들',  slug: 'woowa-tech',  feedUrl: 'https://techblog.woowahan.com/feed',              homeUrl: 'https://techblog.woowahan.com' },
    { name: '카카오 Tech',   slug: 'kakao-tech',  feedUrl: 'https://tech.kakao.com/feed/',                    homeUrl: 'https://tech.kakao.com' },
    { name: '라인 Tech',     slug: 'line-tech',   feedUrl: 'https://techblog.lycorp.co.jp/ko/feed/index.xml', homeUrl: 'https://techblog.lycorp.co.jp/ko' },
  ]

  for (const source of rssSources) {
    await prisma.rssSource.upsert({
      where: { slug: source.slug },
      update: {},
      create: source,
    })
  }
  console.log('✓ RSS sources seeded')

  // Tags
  const tags = [
    { name: 'React',    slug: 'react',    color: '#61DAFB' },
    { name: 'AI',       slug: 'ai',       color: '#10B981' },
    { name: 'DB',       slug: 'db',       color: '#F59E0B' },
    { name: 'DevOps',   slug: 'devops',   color: '#6366F1' },
    { name: 'Mobile',   slug: 'mobile',   color: '#EC4899' },
    { name: 'Backend',  slug: 'backend',  color: '#8B5CF6' },
    { name: 'Frontend', slug: 'frontend', color: '#3B82F6' },
    { name: 'Security', slug: 'security', color: '#EF4444' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
  }
  console.log('✓ Tags seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
