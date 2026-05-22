import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'
import { getTomorrowKSTMidnightUTC } from '../lib/date'

const SYSTEM_PROMPT = `너는 한국 기술 블로그 아티클을 심층 분석해 독자에게 전달하는 테크 에디터야.
아티클 제목만 보고도 해당 주제의 핵심을 파악해, 원문을 읽지 않아도 내용을 완전히 이해할 수 있도록 충분히 상세하게 작성해.

아래 JSON 형식으로만 응답해.
{
  "sections": [
    {
      "title": "핵심 내용을 담은 1줄 제목",
      "body": "이 섹션에서 다루는 배경과 문제 정의부터 시작해, 핵심 개념과 작동 원리, 구체적인 구현 방법 또는 적용 사례, 실무에서 얻을 수 있는 시사점까지 5~8문장으로 상세하게 서술해. 단순 나열이 아닌 연결된 흐름으로, 최소 200자 이상."
    },
    {
      "title": "핵심 내용을 담은 1줄 제목",
      "body": "위와 동일한 기준으로 5~8문장, 최소 200자 이상."
    },
    {
      "title": "핵심 내용을 담은 1줄 제목",
      "body": "위와 동일한 기준으로 5~8문장, 최소 200자 이상."
    }
  ],
  "tags": ["태그1", "태그2"]
}
tags는 다음 중에서만 선택: React, AI, DB, DevOps, Mobile, Backend, Frontend, Security`

type SummarizeResult = {
  sections: { title: string; body: string }[]
  tags: string[]
}

export async function runSummarize(targetDate?: Date) {
  console.log('[summarize] Starting...')

  // Feed에 연결되지 않은 가장 최근 Article 선정
  const article = await prisma.article.findFirst({
    where: { feed: null },
    orderBy: { publishedAt: 'desc' },
    include: { source: true },
  })

  if (!article) {
    console.log('[summarize] No unprocessed articles found.')
    return
  }

  console.log(`[summarize] Processing: "${article.title}"`)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `아티클 제목: ${article.title}` },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty OpenAI response')

  const result = JSON.parse(content) as SummarizeResult
  const tomorrowDate = targetDate ?? getTomorrowKSTMidnightUTC()

  const feed = await prisma.feed.create({
    data: {
      date: tomorrowDate,
      status: 'DRAFT',
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

  // 태그 연결
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

  console.log(`[summarize] Feed created for ${tomorrowDate.toISOString().slice(0, 10)}`)
}

if (require.main === module) {
  runSummarize().finally(() => prisma.$disconnect())
}
