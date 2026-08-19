// 사이트 전역 SEO 상수 — metadata / sitemap / robots / JSON-LD 가 모두 여기를 참조한다
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://todays-tech-tt-web.vercel.app'
).replace(/\/+$/, '')

export const SITE_NAME = "TT - Today's Tech"

export const SITE_TITLE = "TT - Today's Tech | 매일 아침 AI가 요약해주는 국내 기술 블로그"

export const SITE_DESCRIPTION =
  '국내 주요 기술 블로그를 매일 자동으로 크롤링해 AI가 요약·발행하는 테크 뉴스레터 서비스'

export const SITE_KEYWORDS = [
  '기술 블로그',
  '개발자 뉴스레터',
  '테크 뉴스',
  'AI 요약',
  '개발 아티클',
  '기술 아티클 모음',
  '네이버 기술블로그',
  '카카오 기술블로그',
  '토스 기술블로그',
  '우아한형제들 기술블로그',
  '당근 기술블로그',
]

export const DEFAULT_OG_IMAGE = '/images/og-image.png'

/** 검색엔진 소유확인 메타태그 — 환경변수가 있을 때만 렌더한다 */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
export const NAVER_SITE_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** description 용으로 본문을 한 문장 단위로 잘라낸다 */
export function toMetaDescription(text: string, maxLength = 155): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}
