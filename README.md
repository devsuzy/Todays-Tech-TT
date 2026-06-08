# Today's Tech (TT)

### 국내 주요 기술 블로그를 매일 자동으로 크롤링해 AI가 요약·발행하는 테크 뉴스레터 서비스

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?logo=openai)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo)

**🌐 Live:** https://todays-tech-tt-web.vercel.app

---

## 서비스 소개

**Today's Tech**는 토스, 당근, 우아한형제들, 카카오, 라인 등 국내 주요 기술 블로그의 RSS를 매일 자동 크롤링하고, `gpt-4o-mini`로 핵심 내용을 3개 섹션으로 요약해 하루 1개 피드를 발행합니다.

원문을 읽지 않아도 아티클의 배경, 핵심 개념, 실무 시사점까지 완전히 파악할 수 있는 수준의 상세 요약을 제공하는 것이 목표입니다. 현재는 **비회원 MVP** — 로그인, 광고 없이 콘텐츠 전달에 집중합니다.

---

## 주요 기능

- **자동 크롤링**: 기술 블로그 RSS를 매일 06:00(KST) 수집, `guid` 기반 중복 제거
- **AI 요약**: `gpt-4o-mini`로 3개 섹션(각 5~8문장, 200자 이내) 심층 요약 생성
- **OG 이미지**: 원문 페이지의 `og:image`를 자동 추출해 썸네일로 표시
- **아카이브 페이지**: 발행된 피드 목록을 최신순으로 나열, 태그별 필터링, 무한스크롤 (20개 단위)
- **검색**: 아티클 타이틀 및 요약 섹션 키워드 전문 검색
- **피드 상세 페이지**: 섹션별 요약 + 출처 정보 + 태그 표시
- **내일 피드 미리보기**: 비공개 DRAFT 상태의 다음 날 피드를 미리 볼 수 있는 잠금 해제 UI
- **Slack 알림 구독**: Add to Slack 버튼으로 OAuth 연동, 매일 09:00(KST) 오늘 피드를 Block Kit 포맷으로 자동 발송
- **일일 자동 파이프라인**: 크롤(06:00) → 요약(07:00) → 발행(08:00) → Slack 알림(09:00) 4단계 cron 자동화

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | Turborepo 2 |
| 프론트엔드 | Next.js 16 (App Router), React 19, TypeScript |
| UI | shadcn/ui, Base UI, Tailwind CSS 4, Lucide React |
| 백엔드 | Express 4, TypeScript, node-cron 3 |
| 데이터베이스 | PostgreSQL 17, Prisma 6 |
| AI | OpenAI SDK 4 (gpt-4o-mini) |
| 배포 | Vercel (web), Railway (server), Supabase (PostgreSQL) |
| 패키지 매니저 | npm 10 (workspaces) |

---

## 프로젝트 구조

```
todays-tech-TT/
├── apps/
│   ├── web/          # Next.js 16 프론트엔드 (:3000)
│   └── server/       # Express API 서버 + cron (:4000)
│       └── prisma/   # 스키마 + 마이그레이션 + 시드
├── railway.json      # Railway 배포 설정 (NIXPACKS)
├── .env.example
└── turbo.json
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

프로젝트 루트에 `.env` 파일 생성 (`.env.example` 참고):

```env
# 데이터베이스
DATABASE_URL=postgresql://<user>@localhost:5432/todays_tech_tt

# OpenAI
OPENAI_API_KEY=sk-...

# 서버
PORT=4000
WEB_ORIGIN=http://localhost:3000
SITE_URL=http://localhost:3000
TZ=Asia/Seoul

# 프론트엔드
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL DB 생성
createdb todays_tech_tt

# 마이그레이션 실행
npm run db:migrate -w @tt/server

# 시드 데이터 삽입 (RssSource 5개, Tag 8개)
npm run db:seed -w @tt/server
```

### 4. 개발 서버 실행

```bash
# web(:3000) + server(:4000) 동시 실행
npm run dev
```

---

## 사용 가능한 명령어

### 루트 (Turborepo)

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | web + server 동시 개발 서버 실행 |
| `npm run build` | 전체 빌드 |
| `npm run type-check` | 전체 타입 체크 |

### apps/server

| 명령어 | 설명 |
|--------|------|
| `npm run crawl` | RSS 크롤링 수동 실행 |
| `npm run summarize` | AI 요약 수동 실행 |
| `npm run publish` | 피드 발행 수동 실행 |
| `npm run slack-notify` | Slack 알림 수동 발송 |
| `npm run db:migrate` | Prisma 마이그레이션 |
| `npm run db:seed` | 시드 데이터 삽입 |
| `npm run db:studio` | Prisma Studio 실행 |

---

## API 엔드포인트

Base URL: `https://todays-tech-tt-production.up.railway.app/api/v1`

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/feeds` | 발행된 피드 목록 (`?tag=react&skip=0&limit=20`) |
| `GET` | `/feeds/search?q=` | 키워드 전문 검색 |
| `GET` | `/feeds/today` | 오늘 피드 상세 |
| `GET` | `/feeds/tomorrow` | 내일 피드 (DRAFT, 미리보기용) |
| `GET` | `/feeds/:date` | 날짜별 피드 상세 (`YYYY-MM-DD`) |
| `GET` | `/tags` | 전체 태그 목록 |
| `GET` | `/slack/oauth/start` | Slack OAuth 인증 시작 (Slack 페이지로 리다이렉트) |
| `GET` | `/slack/oauth/callback` | Slack OAuth 콜백 (code → webhook URL 저장) |
| `POST` | `/slack/send` | Slack 알림 수동 발송 (테스트용) |

---

## Slack 구독

헤더 벨 아이콘 클릭 → **Add to Slack** 버튼 클릭 → Slack에서 워크스페이스와 채널 선택 → 허용

연동이 완료되면 매일 09:00(KST)에 선택한 채널로 오늘의 피드가 자동 발송됩니다.

> 수동 발송(테스트용): `POST /api/v1/slack/send`

---

## 일일 파이프라인

매일 KST 기준으로 4단계 cron이 자동 실행됩니다.

```
06:00 KST  ┌─────────────────┐
           │   1. crawl      │  RSS 크롤링 → Article 저장 (guid 중복 제거)
           └────────┬────────┘
                    │
07:00 KST  ┌────────▼────────┐
           │  2. summarize   │  최신 Article 선정 → gpt-4o-mini 요약
           │                 │  → Feed(DRAFT) + FeedSection 3개 저장
           └────────┬────────┘
                    │
08:00 KST  ┌────────▼────────┐
           │   3. publish    │  오늘 날짜의 DRAFT → PUBLISHED
           └────────┬────────┘
                    │
09:00 KST  ┌────────▼────────┐
           │ 4. slack-notify │  PUBLISHED 피드 → 구독자 전체 Slack 발송
           └─────────────────┘
```

서버 재시작 시 `catchup.ts`가 오늘 피드 누락 여부를 확인해 전체 파이프라인을 즉시 실행합니다.

수동 실행: `apps/server` 디렉터리에서 각 `npm run <job>` 명령어로 단계별 실행 가능.

---

## 데이터베이스 스키마

| 모델 | 설명 |
|------|------|
| `RssSource` | 크롤링할 기술 블로그 소스 (토스, 당근, 우아한형제들, 카카오, 라인 등 국내 유명 기술 블로그) |
| `Article` | RSS에서 수집된 원문 아티클 (`guid` 고유, `ogImage` 포함) |
| `Feed` | 하루 1개 피드 (`date` 고유, `DRAFT`/`PUBLISHED` 상태) |
| `FeedSection` | 피드 내 요약 섹션 (피드당 3개, `title` + `body`) |
| `Tag` | 분류 태그 (React, AI, DB, DevOps, Mobile, Backend, Frontend, Security) |
| `FeedTag` | Feed ↔ Tag 다대다 조인 테이블 |
| `SlackSubscriber` | Slack 알림 구독자 (웹훅 URL 저장) |

> 모든 Feed `date`는 UTC 기준 자정으로 저장됩니다 (KST 자정 = UTC-9h).

---

## 배포

| 역할 | 서비스 | 비고 |
|------|--------|------|
| Web (Next.js) | Vercel | Root Directory: `apps/web` |
| Server (Express + cron) | Railway | `railway.json` (NIXPACKS 빌더) |
| Database (PostgreSQL) | Supabase | Session pooler (migrate) + Transaction pooler (runtime) |

**Railway 환경변수:** `DATABASE_URL`, `DIRECT_URL`, `OPENAI_API_KEY`, `PORT`, `WEB_ORIGIN`, `SITE_URL`, `TZ=Asia/Seoul`, `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SERVER_URL`

**Vercel 환경변수:** `NEXT_PUBLIC_API_BASE_URL`

---

## 환경변수

| 변수명 | 위치 | 필수 | 설명 |
|--------|------|:----:|------|
| `DATABASE_URL` | Railway | ✅ | PostgreSQL 연결 문자열 (Transaction pooler) |
| `DIRECT_URL` | Railway | ✅ | PostgreSQL 연결 문자열 (Session pooler, 마이그레이션용) |
| `OPENAI_API_KEY` | Railway | ✅ | OpenAI API 키 |
| `PORT` | Railway | | Express 포트 (기본값 4000) |
| `WEB_ORIGIN` | Railway | | CORS 허용 오리진 (Vercel 도메인) |
| `SITE_URL` | Railway | | Slack 알림 내 링크 베이스 URL |
| `TZ` | Railway | ✅ | `Asia/Seoul` (cron KST 기준 필수) |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel | ✅ | API 서버 주소 (Railway 도메인) |
| `SLACK_CLIENT_ID` | Railway | | Slack 앱 Client ID |
| `SLACK_CLIENT_SECRET` | Railway | | Slack 앱 Client Secret |
| `SERVER_URL` | Railway | | 서버 공개 URL (Slack OAuth redirect_uri 기준) |
