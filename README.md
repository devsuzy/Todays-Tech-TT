# Today's Tech (TT)

### 국내 주요 기술 블로그를 매일 자동으로 크롤링해 AI가 요약·발행하는 테크 뉴스레터 서비스

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?logo=openai)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo)

---

## 서비스 소개

**Today's Tech**는 토스, 당근, 우아한형제들, 카카오, 라인 등 국내 5개 주요 기술 블로그의 RSS를 매일 자동 크롤링하고, `gpt-4o-mini`로 핵심 내용을 3개 섹션으로 요약해 하루 1개 피드를 발행합니다.

원문을 읽지 않아도 아티클의 배경, 핵심 개념, 실무 시사점까지 완전히 파악할 수 있는 수준의 상세 요약을 제공하는 것이 목표입니다. 현재는 **비회원 MVP** — 로그인, 광고 없이 콘텐츠 전달에 집중합니다.

---

## 주요 기능

- **자동 크롤링**: 5개 기술 블로그 RSS를 매일 06:00(KST) 수집, `guid` 기반 중복 제거
- **AI 요약**: `gpt-4o-mini`로 3개 섹션(각 5~8문장, 200자+) 심층 요약 생성
- **OG 이미지**: 원문 페이지의 `og:image`를 자동 추출해 썸네일로 표시
- **아카이브 페이지**: 발행된 피드 목록을 최신순으로 나열, 태그별 필터링
- **피드 상세 페이지**: 섹션별 요약 + 출처 정보 + 태그 표시
- **내일 피드 미리보기**: 비공개 DRAFT 상태의 다음 날 피드를 미리 볼 수 있는 잠금 해제 UI
- **일일 자동 파이프라인**: 크롤(06:00) → 요약(07:00) → 발행(08:00) 3단계 cron 자동화

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | Turborepo 2 |
| 프론트엔드 | Next.js 16 (App Router), React 19, TypeScript |
| UI | shadcn/ui, Tailwind CSS 4 |
| 백엔드 | Express 4, TypeScript, node-cron 3 |
| 데이터베이스 | PostgreSQL 17, Prisma 6 |
| AI | OpenAI SDK 4 (gpt-4o-mini) |
| 패키지 매니저 | npm 10 (workspaces) |

---

## 프로젝트 구조

```
todays-tech-TT/
├── apps/
│   ├── web/                        # Next.js 16 프론트엔드 (:3000)
│   │   ├── app/
│   │   │   ├── page.tsx            # → redirect /archive
│   │   │   ├── archive/page.tsx    # 피드 목록 + 태그 필터
│   │   │   └── feed/[date]/page.tsx # 피드 상세
│   │   ├── components/
│   │   │   ├── header.tsx
│   │   │   ├── tag-filter-bar.tsx 
│   │   │   ├── feed-card.tsx
│   │   │   ├── feed-section-item.tsx
│   │   │   └── tomorrow-preview.tsx 
│   │   ├── lib/
│   │   │   ├── api.ts              # fetch 헬퍼
│   │   │   └── date-utils.ts       # KST 날짜 포맷
│   │   └── types/index.ts
│   │
│   └── server/                     # Express API 서버 (:4000)
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts             # RssSource 5개, Tag 8개
│       └── src/
│           ├── index.ts            # Express 진입점
│           ├── lib/
│           │   ├── prisma.ts       # Prisma client singleton
│           │   └── openai.ts       # OpenAI client
│           ├── jobs/
│           │   ├── crawl.ts        # RSS 크롤링
│           │   ├── summarize.ts    # AI 요약
│           │   └── publish.ts      # DRAFT → PUBLISHED
│           ├── cron/
│           │   └── dailyPipeline.ts # 일일 cron 스케줄
│           └── routes/
│               ├── feeds.ts
│               └── tags.ts
│
├── packages/
│   ├── tsconfig/                   # 공유 TypeScript 설정
│   └── ui/                         # 공유 UI 컴포넌트
│
├── turbo.json
├── package.json
└── .env
```

---

## 시작하기

### 사전 요구사항

- **Node.js ≥ 20**
- **PostgreSQL 17** (로컬 설치 또는 Docker)
- **OpenAI API Key**

### 1. 저장소 클론 및 패키지 설치

```bash
git clone <repository-url>
cd todays-tech-TT
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
DATABASE_URL=postgresql://<user>@localhost:5432/todays_tech_tt
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

`apps/web/.env.local` 파일도 생성:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL DB 생성 (psql에서)
createdb todays_tech_tt

# 마이그레이션 실행 (프로젝트 루트에서)
cd apps/server && npx prisma migrate dev

# 시드 데이터 삽입 (RssSource 5개, Tag 8개)
npm run db:seed
```

### 4. 개발 서버 실행

```bash
# 프로젝트 루트에서 — web(:3000) + server(:4000) 동시 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 사용 가능한 명령어

### 루트 (Turborepo)

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | web + server 동시 개발 서버 실행 |
| `npm run build` | 전체 빌드 |
| `npm run lint` | 전체 린트 |

### apps/server

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | ts-node-dev로 서버 실행 (핫 리로드) |
| `npm run crawl` | RSS 크롤링 수동 실행 |
| `npm run summarize` | AI 요약 수동 실행 |
| `npm run publish` | 피드 발행 수동 실행 |
| `npm run db:migrate` | Prisma 마이그레이션 |
| `npm run db:seed` | 시드 데이터 삽입 |
| `npm run db:studio` | Prisma Studio 실행 |

---

## API 엔드포인트

Base URL: `http://localhost:4000/api/v1`

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/feeds` | 발행된 피드 목록 (최신순) |
| `GET` | `/feeds?tag=react` | 태그별 필터링 |
| `GET` | `/feeds/today` | 오늘 피드 상세 |
| `GET` | `/feeds/tomorrow` | 내일 피드 (DRAFT, 미리보기용) |
| `GET` | `/feeds/:date` | 날짜별 피드 상세 (형식: `YYYY-MM-DD`) |
| `GET` | `/tags` | 전체 태그 목록 |

---

## 일일 파이프라인

매일 KST 기준으로 3단계 cron이 자동 실행됩니다.

```
06:00 KST  ┌─────────────┐
           │  1. crawl   │  RSS 크롤링 → Article 저장 (guid 중복 제거)
           └──────┬──────┘
                  │
07:00 KST  ┌─────▼──────┐
           │ 2. summarize│  최신 Article 선정 → gpt-4o-mini 요약
           │             │  → Feed(DRAFT) + FeedSection 3개 저장
           └──────┬──────┘
                  │
08:00 KST  ┌─────▼──────┐
           │ 3. publish  │  오늘 날짜의 DRAFT → PUBLISHED
           └─────────────┘
```

수동 실행: `apps/server` 디렉터리에서 `npm run crawl` / `npm run summarize` / `npm run publish`

---

## 데이터베이스 스키마

| 모델 | 설명 |
|------|------|
| `RssSource` | 크롤링할 기술 블로그 소스 (5개: 토스, 당근, 우아한형제들, 카카오, 라인) |
| `Article` | RSS에서 수집된 원문 아티클 (`guid` 고유, `ogImage` 포함) |
| `Feed` | 하루 1개 피드 (`date` 고유, `DRAFT`/`PUBLISHED` 상태) |
| `FeedSection` | 피드 내 요약 섹션 (피드당 3개, `title` + `body`) |
| `Tag` | 분류 태그 (React, AI, DB, DevOps, Mobile, Backend, Frontend, Security) |
| `FeedTag` | Feed ↔ Tag 다대다 조인 테이블 |
| `SlackSubscriber` | Slack 알림 구독자 (웹훅 URL 저장) |

> 모든 Feed `date`는 UTC 기준 자정으로 저장됩니다 (KST 자정 = UTC-9h).

---

## 환경변수

| 변수명 | 필수 | 설명 |
|--------|:----:|------|
| `DATABASE_URL` | ✅ | PostgreSQL 연결 문자열 (`postgresql://user@host:port/db`) |
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 (`sk-...`) |
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | 프론트엔드에서 호출할 API 서버 주소 (`http://localhost:4000`) |
