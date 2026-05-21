# 서버 파이프라인 — RSS 크롤 + AI 요약 크론

## 개요

매일 새벽, 활성화된 RSS 소스에서 최신 글을 크롤하여  
OpenAI gpt-4o-mini로 요약한 뒤 DB에 저장하는 3단계 자동화 파이프라인.

---

## 서버 디렉토리 구조

```
apps/server/
├── src/
│   ├── cron/
│   │   └── dailyPipeline.ts     # node-cron 스케줄 등록
│   ├── jobs/
│   │   ├── crawl.ts             # Stage 1: RSS 크롤 + Article dedup
│   │   ├── summarize.ts         # Stage 2: OpenAI 요약 호출
│   │   └── publish.ts           # Stage 3: Feed 발행
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── openai.ts            # OpenAI client
│   └── index.ts                 # Express 서버 + 크론 등록
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## 3단계 파이프라인

### Stage 1 — RSS 크롤 (KST 06:00)

```
활성 RssSource 조회 (isActive=true)
  └─ 각 소스 RSS URL fetch (rss-parser)
      └─ 각 item에 대해:
          Article.upsert({ where: { guid }, create: {...} })
          → 이미 존재하면 skip (idempotent)
```

**핵심 코드 패턴 (`jobs/crawl.ts`)**
```ts
const sources = await prisma.rssSource.findMany({ where: { isActive: true } })

for (const source of sources) {
  const feed = await parser.parseURL(source.feedUrl)
  for (const item of feed.items) {
    await prisma.article.upsert({
      where: { guid: item.guid ?? item.link },
      update: {},
      create: {
        sourceId: source.id,
        guid: item.guid ?? item.link,
        title: item.title,
        originalUrl: item.link,
        publishedAt: new Date(item.pubDate),
      },
    })
  }
}
```

---

### Stage 2 — OpenAI 요약 (KST 07:00)

```
아직 Feed에 연결되지 않은 최신 Article 1개 선정
  └─ OpenAI gpt-4o-mini 호출 (structured output)
      └─ 응답 파싱 → Feed(DRAFT) + FeedSection × 3 + Tag 저장
```

**OpenAI 프롬프트 구조**
```
System: 너는 한국 기술 블로그 아티클을 요약하는 전문가야.
        주어진 아티클을 읽고 아래 JSON 형식으로만 응답해.

User: [아티클 제목 + 본문]

Output format:
{
  "sections": [
    { "title": "핵심 주제 1줄", "body": "2~3문장 상세 설명" },
    { "title": "핵심 주제 1줄", "body": "2~3문장 상세 설명" },
    { "title": "핵심 주제 1줄", "body": "2~3문장 상세 설명" }
  ],
  "tags": ["React", "TypeScript"]  // DB에 존재하는 slug 중에서만 선택
}
```

**핵심 코드 패턴 (`jobs/summarize.ts`)**
```ts
// 미처리 Article 1개 선정 (가장 최근 것)
const article = await prisma.article.findFirst({
  where: { feed: null },
  orderBy: { publishedAt: 'desc' },
})
if (!article) return

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  response_format: { type: 'json_object' },
  messages: [/* system + user */],
})

const { sections, tags } = JSON.parse(response.choices[0].message.content)

// 내일 날짜 UTC 자정 계산 (KST 기준)
const tomorrow = getTomorrowKSTMidnightUTC()

const feed = await prisma.feed.create({
  data: {
    date: tomorrow,
    status: 'DRAFT',
    articleId: article.id,
    sections: { create: sections.map((s, i) => ({ order: i + 1, ...s })) },
  },
})

// 태그 연결
for (const tagName of tags) {
  const tag = await prisma.tag.findUnique({ where: { name: tagName } })
  if (tag) await prisma.feedTag.create({ data: { feedId: feed.id, tagId: tag.id } })
}
```

---

### Stage 3 — 피드 발행 (KST 08:00)

```
오늘 날짜 Feed (DRAFT) 찾기
  └─ status: DRAFT → PUBLISHED
```

**핵심 코드 패턴 (`jobs/publish.ts`)**
```ts
const todayUTC = getTodayKSTMidnightUTC()

await prisma.feed.updateMany({
  where: { date: todayUTC, status: 'DRAFT' },
  data: { status: 'PUBLISHED' },
})
```

---

## 크론 스케줄 (`cron/dailyPipeline.ts`)

```ts
import cron from 'node-cron'

// Stage 1: 매일 06:00 KST (= 21:00 UTC 전날)
cron.schedule('0 21 * * *', () => runCrawl(), { timezone: 'Asia/Seoul' })

// Stage 2: 매일 07:00 KST (= 22:00 UTC 전날)
cron.schedule('0 22 * * *', () => runSummarize(), { timezone: 'Asia/Seoul' })

// Stage 3: 매일 08:00 KST (= 23:00 UTC 전날)
cron.schedule('0 23 * * *', () => runPublish(), { timezone: 'Asia/Seoul' })
```

---

## 날짜 유틸리티

```ts
// KST 기준 "오늘" 날짜의 UTC 자정 반환
function getTodayKSTMidnightUTC(): Date {
  const now = new Date()
  // KST = UTC+9
  const kstOffset = 9 * 60 * 60 * 1000
  const kstMidnight = new Date(
    Math.floor((now.getTime() + kstOffset) / 86400000) * 86400000 - kstOffset
  )
  return kstMidnight
}

function getTomorrowKSTMidnightUTC(): Date {
  const today = getTodayKSTMidnightUTC()
  return new Date(today.getTime() + 86400000)
}
```

---

## 비용 추정

| 항목 | 값 |
|------|-----|
| 모델 | gpt-4o-mini |
| 일일 호출 | 1회 |
| 예상 토큰 | 입력 ~2,000 / 출력 ~500 |
| 일일 비용 | ~$0.001 |
| 월간 비용 | **~$0.03** |

---

## P1: Slack Webhook 발송

Stage 3 발행 후 활성 구독자에게 오늘의 피드 요약을 발송.

```ts
// publish.ts 내 Stage 3 완료 후 추가
const subscribers = await prisma.slackSubscriber.findMany({
  where: { isActive: true },
})

for (const sub of subscribers) {
  await fetch(sub.webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      text: `*오늘의 Tech 피드* (${dateStr})\n${sections[0].title}\n${sections[1].title}\n${sections[2].title}`,
    }),
  })
}
```
