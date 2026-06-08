import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'
import { getTodayKSTMidnightUTC, getTomorrowKSTMidnightUTC } from '../lib/date'
import { fetchOgImage } from '../lib/og'

const SYSTEM_PROMPT = `너는 한국 기술 블로그 아티클을 분석해 독자에게 핵심을 전달하는 테크 에디터야.

[문체 규칙]
- 모든 문장을 해요체로 통일해. (예: ~해요, ~있어요, ~됩니다)
- 경어체와 평어체를 절대 혼용하지 마.

[정확성 규칙]
- 제목과 설명에서 확실하게 확인되는 내용만 서술해.
- 추측이나 과장된 표현은 사용하지 마.
- 설명이 짧거나 없으면 제목에서 합리적으로 유추 가능한 범위만 다뤄.

[형식]
아래 JSON 형식으로만 응답해.
{
  "sections": [
    {
      "title": "핵심 내용을 담은 1줄 제목",
      "body": "배경과 문제 정의부터 핵심 개념, 구현 방법, 실무 시사점까지 5~8문장으로 서술해. 200자 이내."
    },
    {
      "title": "핵심 내용을 담은 1줄 제목",
      "body": "위와 동일한 기준. 5~8문장, 200자 이내"
    },
    {
      "title": "핵심 내용을 담은 1줄 제목",
      "body": "위와 동일한 기준. 5~8문장, 200자 이내"
    }
  ],
  "tags": ["태그1", "태그2"]
}
tags는 다음 중에서만 선택: React, AI, DB, DevOps, Mobile, Backend, Frontend, Security`

type SummarizeResult = {
  sections: { title: string; body: string }[]
  tags: string[]
}

type FeedStatus = 'DRAFT' | 'PUBLISHED'

async function createFeedEntry(date: Date, status: FeedStatus) {
  let article = await prisma.article.findFirst({
    where: { feed: null },
    orderBy: { publishedAt: 'desc' },
    include: { source: true },
  })

  if (!article) {
    console.log(`[summarize] No unprocessed articles for ${date.toISOString().slice(0, 10)}`)
    return
  }

  console.log(`[summarize] Processing for ${date.toISOString().slice(0, 10)} (${status}): "${article.title}"`)

  if (!article.ogImage) {
    const ogImage = await fetchOgImage(article.originalUrl)
    if (ogImage) {
      await prisma.article.update({ where: { id: article.id }, data: { ogImage } })
      article = { ...article, ogImage }
    }
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `제목: ${article.title}\n설명: ${article.description ?? '없음'}` },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty OpenAI response')

  const result = JSON.parse(content) as SummarizeResult

  const feed = await prisma.feed.create({
    data: {
      date,
      status,
      articleId: article.id,
      sections: {
        create: result.sections.map((s, i) => ({
          order: i + 1,
          title: s.title,
          body: s.body,
        })),
      },
    },
  })

  for (const tagName of result.tags) {
    const tag = await prisma.tag.findFirst({
      where: { name: { equals: tagName, mode: 'insensitive' } },
    })
    if (tag) {
      await prisma.feedTag.upsert({
        where: { feedId_tagId: { feedId: feed.id, tagId: tag.id } },
        update: {},
        create: { feedId: feed.id, tagId: tag.id },
      })
    }
  }

  console.log(`[summarize] Feed created for ${date.toISOString().slice(0, 10)} (${status})`)
}

export async function runSummarize() {
  console.log('[summarize] Starting...')

  const todayDate = getTodayKSTMidnightUTC()
  const todayExists = await prisma.feed.findUnique({ where: { date: todayDate } })
  if (todayExists) {
    console.log(`[summarize] Today's feed already exists (${todayDate.toISOString().slice(0, 10)})`)
  } else {
    await createFeedEntry(todayDate, 'PUBLISHED')
  }

  const tomorrowDate = getTomorrowKSTMidnightUTC()
  const tomorrowExists = await prisma.feed.findUnique({ where: { date: tomorrowDate } })
  if (tomorrowExists) {
    console.log(`[summarize] Tomorrow's feed already exists (${tomorrowDate.toISOString().slice(0, 10)})`)
  } else {
    await createFeedEntry(tomorrowDate, 'DRAFT')
  }

  console.log('[summarize] Done.')
}

if (require.main === module) {
  runSummarize().finally(() => prisma.$disconnect())
}
