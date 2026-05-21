# Today's Tech (TT) — 서비스 개요

## 서비스 소개

**Today's Tech**는 매일 하나의 AI 요약 피드를 발행하는 국내 기술 블로그 다이제스트 서비스입니다.  
1차 프로토타입은 **비회원 기반**으로, 로그인 없이 누구나 사용할 수 있습니다.

---

## 기능 우선순위

| 우선순위 | 기능 | 타임라인 |
|----------|------|----------|
| **P0** | RSS 크롤러 + OpenAI 요약 크론 파이프라인 | 1주차 |
| **P0** | 메인 피드 상세 화면 (타이틀 3개 + 상세 문장) | 2주차 |
| **P0** | 아카이브 리스트 (날짜순 정렬) | 2주차 |
| **P0** | 기술 태그 필터링 | 2주차 |
| **P1** | 내일 피드 미리보기 (Fake Loading + LocalStorage) | 2주차 후반 |
| **P1** | Slack Webhook 구독 기능 | 2주차 후반 |
| **P2** | OAuth 로그인, 북마크, 실제 광고 SDK | 백로그 |

---

## 2주 개발 로드맵

### 1주차 — 데이터 파이프라인 & 백엔드 안정화
1. Turborepo 모노레포 환경 세팅 및 DB 스키마 정의
2. RSS 파서 (`rss-parser`) + OpenAI API 활용 '하루 1개 요약 생성' 크론 구현
3. 파이프라인 검증: AI가 생성한 요약 데이터가 DB에 규격대로 저장되는지 확인

### 2주차 — 프론트엔드 UI/UX 완성
1. Next.js 기반 메인 피드 + 아카이브 페이지 UI 개발 (shadcn/ui)
2. 태그 필터링 및 날짜별 아카이브 렌더링 최적화
3. P1: LocalStorage 활용 '내일 피드 미리보기' 인터랙션
4. P1: Slack Webhook 구독 입력 폼

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | Turborepo |
| 프론트엔드 | Next.js 14+ (App Router, RSC, ISR) |
| 백엔드 | Express + Node.js + node-cron |
| 데이터베이스 | PostgreSQL + Prisma |
| AI 요약 | OpenAI gpt-4o-mini |
| RSS 파싱 | rss-parser (npm) |
| UI | shadcn/ui + Tailwind CSS |
| 상태 저장 | Browser LocalStorage (미리보기 잠금 해제) |

---

## 모노레포 구조

```
todays-tech-TT/
├── apps/
│   ├── web/               # Next.js 14 (App Router, RSC)
│   └── server/            # Express + node-cron (RSS + AI 파이프라인)
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── ui/                # shadcn/ui + Tailwind 공통 컴포넌트
│   └── tsconfig/          # 공유 TypeScript 설정
│
├── docs/
│   ├── 00-overview.md               # (이 파일) 서비스 개요 + 로드맵
│   ├── 01-data-model.md             # Prisma 스키마
│   ├── 02-component-architecture.md # 페이지 & 컴포넌트 구조
│   └── 03-server-pipeline.md        # RSS+AI 크론 파이프라인 설계
│
├── turbo.json
└── package.json
```

---

## 환경 변수

```env
# 공통
DATABASE_URL=postgresql://...

# apps/server 전용
OPENAI_API_KEY=sk-...
CRON_SECRET=...          # 내부 API 보호용 (optional for 1차)
```
