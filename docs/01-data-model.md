# 데이터 모델 — Prisma 스키마

## 핵심 원칙

- 비회원 서비스: 유저 테이블 없음, AdView 테이블 없음
- **P0 파이프라인 포함**: `RssSource`, `Article` 테이블로 RSS 크롤 dedup + 소스 추적
- 피드 1개 = AI가 선정한 Article 1개 → 타이틀 3개 + 상세 문장 (`FeedSection`)
- 아카이브 태그 필터링: `Feed ↔ Tag M:M`
- P1 Slack webhook: `SlackSubscriber` (단순 webhookUrl 저장)

---

## 엔티티 관계

```
RssSource ──< Article
Article ──── Feed (1:1 optional)
Feed ──< FeedSection (1:N, onDelete Cascade)
Feed ──< FeedTag >── Tag (M:M)
[P1] SlackSubscriber (독립)
```

---

## Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// RSS 소스 (크롤 대상 블로그)
// ─────────────────────────────────────────
model RssSource {
  id       Int       @id @default(autoincrement())
  name     String    // "Toss Tech", "당근마켓 Tech"
  slug     String    @unique
  feedUrl  String    @unique
  homeUrl  String
  isActive Boolean   @default(true)
  articles Article[]
}

// ─────────────────────────────────────────
// 크롤된 아티클 (dedup 키: guid)
// ─────────────────────────────────────────
model Article {
  id          Int       @id @default(autoincrement())
  sourceId    Int
  source      RssSource @relation(fields: [sourceId], references: [id])
  guid        String    @unique  // RSS item guid — dedup 키
  title       String
  originalUrl String
  publishedAt DateTime
  feed        Feed?               // 선정된 날 Feed와 연결
}

// ─────────────────────────────────────────
// 날짜별 피드 (하루 1개)
// ─────────────────────────────────────────
model Feed {
  id          Int           @id @default(autoincrement())
  date        DateTime      @unique   // 해당 날짜 UTC 자정 기준
  status      FeedStatus    @default(DRAFT)
  articleId   Int?          @unique   // 선정된 원본 아티클 (optional)
  article     Article?      @relation(fields: [articleId], references: [id])
  sections    FeedSection[]
  tags        FeedTag[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

// ─────────────────────────────────────────
// 피드 내 섹션 (AI 생성: 타이틀 + 상세 문장 × 3)
// ─────────────────────────────────────────
model FeedSection {
  id     Int    @id @default(autoincrement())
  feedId Int
  feed   Feed   @relation(fields: [feedId], references: [id], onDelete: Cascade)
  order  Int    // 1 | 2 | 3 — 노출 순서
  title  String
  body   String @db.Text
}

// ─────────────────────────────────────────
// 기술 태그 (AI 추출)
// ─────────────────────────────────────────
model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique  // 표시명: "React", "AI", "DB"
  slug  String    @unique  // URL 파라미터용: "react", "ai", "db"
  color String?            // 뱃지 색상 hex: "#61DAFB"
  feeds FeedTag[]
}

// ─────────────────────────────────────────
// Feed ↔ Tag 조인 테이블
// ─────────────────────────────────────────
model FeedTag {
  feedId Int
  tagId  Int
  feed   Feed @relation(fields: [feedId], references: [id])
  tag    Tag  @relation(fields: [tagId], references: [id])

  @@id([feedId, tagId])
}

// ─────────────────────────────────────────
// [P1] Slack Webhook 구독자
// ─────────────────────────────────────────
model SlackSubscriber {
  id         Int      @id @default(autoincrement())
  webhookUrl String   @unique
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
}

// ─────────────────────────────────────────
// 열거형
// ─────────────────────────────────────────
enum FeedStatus {
  DRAFT      // 작성 중 또는 예정 피드 (내일 피드 포함)
  PUBLISHED  // 공개된 피드
}
```

---

## 설계 결정 근거

| 결정 | 이유 |
|------|------|
| `RssSource` 추가 | P0 크론 파이프라인이 크롤 대상을 DB에서 읽어야 함 (`isActive` 토글 가능) |
| `Article` 추가 | `guid @unique`로 중복 크롤 방지 (idempotent insert) |
| `Feed.articleId` optional | 파이프라인이 Article 선정 후 Feed와 연결; 초기 수동 시드 시 null 허용 |
| `FeedSection` 유지 | AI 출력 포맷(타이틀 + 상세 문장)과 정확히 대응 |
| `AdView` 없음 | 미리보기 잠금 해제는 LocalStorage만으로 처리 — DB 왕복 없음 |
| `SlackSubscriber` P1 | 단순 URL 저장만 필요; 크론 발송 시 `isActive=true` 전체 조회 |

---

## 주요 쿼리 패턴

```ts
// 아카이브 목록 (태그 필터 포함)
prisma.feed.findMany({
  where: {
    status: 'PUBLISHED',
    tags: slug ? { some: { tag: { slug } } } : undefined,
  },
  include: {
    sections: { orderBy: { order: 'asc' }, take: 1 },
    tags: { include: { tag: true } },
  },
  orderBy: { date: 'desc' },
})

// 특정 날짜 피드 상세
prisma.feed.findUnique({
  where: { date: targetDate },
  include: {
    sections: { orderBy: { order: 'asc' } },
    tags: { include: { tag: true } },
    article: { include: { source: true } },
  },
})

// 내일 피드 (DRAFT — 미리보기용)
prisma.feed.findUnique({
  where: { date: tomorrowDate },
  include: { sections: { orderBy: { order: 'asc' } } },
})

// RSS 크롤 대상 소스 조회
prisma.rssSource.findMany({ where: { isActive: true } })

// Article dedup insert (파이프라인 크롤 단계)
prisma.article.upsert({
  where: { guid },
  update: {},
  create: { guid, sourceId, title, originalUrl, publishedAt },
})
```

---

## 시드 데이터

```ts
// RSS 소스
const rssSources = [
  { name: 'Toss Tech',    slug: 'toss-tech',   feedUrl: 'https://toss.tech/rss.xml',                          homeUrl: 'https://toss.tech' },
  { name: '당근마켓 Tech', slug: 'daangn-tech', feedUrl: 'https://medium.com/feed/daangn',                     homeUrl: 'https://medium.com/daangn' },
  { name: '우아한형제들', slug: 'woowa-tech',   feedUrl: 'https://techblog.woowahan.com/feed',                 homeUrl: 'https://techblog.woowahan.com' },
  { name: '카카오 Tech',  slug: 'kakao-tech',  feedUrl: 'https://tech.kakao.com/feed/',                       homeUrl: 'https://tech.kakao.com' },
  { name: '라인 Tech',    slug: 'line-tech',   feedUrl: 'https://techblog.lycorp.co.jp/ko/feed/index.xml',    homeUrl: 'https://techblog.lycorp.co.jp/ko' },
]

// 기술 태그
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
```
