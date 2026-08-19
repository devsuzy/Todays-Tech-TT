import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// /feed/today 와 내일 피드(DRAFT)는 차단하지 않는다 —
// 전자는 canonical 로 날짜 URL에 합쳐지고 후자는 noindex 메타를 쓰므로, 크롤이 돼야 그 신호가 읽힌다
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      // 국내 검색 노출용 — 네이버 Yeti, 다음 Daum
      { userAgent: 'Yeti', allow: '/', disallow: '/api/' },
      { userAgent: 'Daum', allow: '/', disallow: '/api/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
