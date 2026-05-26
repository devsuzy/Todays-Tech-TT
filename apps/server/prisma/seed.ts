import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // RSS Sources
  const rssSources = [
    { name: 'Toss Tech',      slug: 'toss-tech',            feedUrl: 'https://toss.tech/rss.xml',                        homeUrl: 'https://toss.tech' },
    { name: '당근마켓 Tech',  slug: 'daangn-tech',          feedUrl: 'https://medium.com/feed/daangn',                   homeUrl: 'https://medium.com/daangn' },
    { name: '우아한형제들',   slug: 'woowa-tech',           feedUrl: 'https://techblog.woowahan.com/feed',               homeUrl: 'https://techblog.woowahan.com' },
    { name: '카카오 Tech',    slug: 'kakao-tech',           feedUrl: 'https://tech.kakao.com/feed/',                     homeUrl: 'https://tech.kakao.com' },
    { name: '라인 Tech',      slug: 'line-tech',            feedUrl: 'https://techblog.lycorp.co.jp/ko/feed/index.xml',  homeUrl: 'https://techblog.lycorp.co.jp/ko' },
    { name: '네이버 D2',      slug: 'naver-d2',             feedUrl: 'https://d2.naver.com/d2.atom',                     homeUrl: 'https://d2.naver.com/home' },
    { name: '무신사 Tech',    slug: 'musinsa-tech',         feedUrl: 'https://medium.com/feed/musinsa-tech',             homeUrl: 'https://techblog.musinsa.com' },
    { name: '여기어때 Tech',  slug: 'gccompany-tech',       feedUrl: 'https://medium.com/feed/gccompany',                homeUrl: 'https://techblog.gccompany.co.kr' },
    { name: '쿠팡 Engineering', slug: 'coupang-engineering', feedUrl: 'https://medium.com/feed/coupang-engineering',     homeUrl: 'https://medium.com/coupang-engineering' },
    { name: '카카오페이 Tech', slug: 'kakaopay-tech',       feedUrl: 'https://tech.kakaopay.com/rss.xml',                homeUrl: 'https://tech.kakaopay.com' },
    { name: '올리브영 Tech',  slug: 'oliveyoung-tech',      feedUrl: 'https://oliveyoung.tech/rss.xml',                  homeUrl: 'https://oliveyoung.tech' },
    { name: '컬리 Tech',      slug: 'kurly-tech',           feedUrl: 'https://helloworld.kurly.com/rss.xml',             homeUrl: 'https://helloworld.kurly.com' },
    { name: '뱅크샐러드',     slug: 'banksalad-tech',       feedUrl: 'https://blog.banksalad.com/rss.xml',               homeUrl: 'https://blog.banksalad.com' },
    { name: 'kt cloud Tech',  slug: 'ktcloud-tech',         feedUrl: 'https://tech.ktcloud.com/rss',                     homeUrl: 'https://tech.ktcloud.com' },
  ]

  for (const source of rssSources) {
    await prisma.rssSource.upsert({
      where: { slug: source.slug },
      update: {},
      create: source,
    })
  }
  console.log('✓ RSS sources seeded')

  // React 태그 제거
  await prisma.tag.deleteMany({ where: { slug: 'react' } })

  // Tags
  const tags = [
    { name: 'Architecture', slug: 'architecture', color: '#0EA5E9' },
    { name: 'AI',           slug: 'ai',           color: '#10B981' },
    { name: 'DB',           slug: 'db',           color: '#F59E0B' },
    { name: 'DevOps',       slug: 'devops',       color: '#6366F1' },
    { name: 'Mobile',       slug: 'mobile',       color: '#EC4899' },
    { name: 'Backend',      slug: 'backend',      color: '#8B5CF6' },
    { name: 'Frontend',     slug: 'frontend',     color: '#3B82F6' },
    { name: 'Security',     slug: 'security',     color: '#EF4444' },
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
