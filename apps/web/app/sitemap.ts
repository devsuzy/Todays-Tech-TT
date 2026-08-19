import type { MetadataRoute } from 'next'
import { getFeedDates, getTags } from '@/lib/api'
import { toKSTDateString } from '@/lib/date-utils'
import { SITE_URL } from '@/lib/site'

// 매일 08:00 발행되므로 1시간마다 재생성
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [feedDates, tags] = await Promise.all([getFeedDates(), getTags()])

  const lastPublished = feedDates[0] ? new Date(feedDates[0].updatedAt) : new Date()

  const archive: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/archive`,
      lastModified: lastPublished,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/archive?tag=${tag.slug}`,
    lastModified: lastPublished,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const feedPages: MetadataRoute.Sitemap = feedDates.map(({ date, updatedAt }) => ({
    url: `${SITE_URL}/feed/${toKSTDateString(date)}`,
    lastModified: new Date(updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...archive, ...tagPages, ...feedPages]
}
