# 컴포넌트 아키텍처

## 페이지 구조 (`apps/web/app/`)

```
apps/web/app/
├── layout.tsx               # Root layout — GNB (로고 + 서비스명)
├── page.tsx                 # "/" → /archive 리다이렉트
│
├── archive/
│   └── page.tsx             # [메인화면] 아카이브 리스트 + 태그 필터
│
└── feed/
    └── [date]/
        └── page.tsx         # [상세화면] 특정 날짜 피드 상세
```

### 라우팅 규칙

| 경로 | 동작 |
|------|------|
| `/` | `/archive`로 리다이렉트 |
| `/archive` | 전체 피드 리스트 (메인 화면) |
| `/archive?tag=react` | 태그 필터 적용 리스트 |
| `/feed/2025-05-21` | 해당 날짜 피드 상세 |
| `/feed/today` | 서버에서 오늘 날짜로 rewrite → 상세 화면 |

---

## 아카이브 페이지 `/archive`

```
ArchivePage (RSC)
├── <Header />  (RSC)
│   └── 로고 / "Today's Tech"
│
├── <TagFilterBar />  (Client — URL 쿼리 파라미터 기반 필터)
│   ├── <TagChip label="전체" />
│   └── <TagChip /> × N   (React, AI, DB, DevOps …)
│
└── <FeedList feeds={feeds} />  (RSC)
    └── <FeedCard /> × N
        ├── <DateBadge date />         // "2025.05.21 (수)"
        ├── <TagBadge[] tags />        // 색상 뱃지
        └── <FeedCardTitle title />    // 첫 번째 FeedSection.title
```

### Server / Client 경계

| 컴포넌트 | 타입 | 이유 |
|----------|------|------|
| `ArchivePage` | RSC | DB 조회, ISR 캐시 활용 |
| `TagFilterBar` | Client | `useRouter`로 URL 쿼리 변경 |
| `FeedList` | RSC | 서버에서 필터링된 props 수신 |
| `FeedCard` | RSC | 정적 렌더링 |

### 필터링 흐름

```
TagChip 클릭
  → router.push('/archive?tag=react')
  → ArchivePage 서버에서 searchParams.tag 읽어 Prisma 쿼리 적용
  → 필터된 FeedList 반환
```

---

## 상세 화면 `/feed/[date]`

```
FeedDetailPage (RSC)
├── <Header />  (RSC)
│   ├── <BackButton />              // ← 아카이브로
│   └── <DateDisplay date />        // "2025년 5월 21일"
│
├── <FeedBody />  (RSC)
│   └── <FeedSection /> × 3
│       ├── <SectionTitle order title />   // "1. 타이틀 텍스트"
│       └── <SectionBody body />           // 상세 문장
│
├── <TagList tags />  (RSC)
│   └── <TagBadge /> × N
│
└── <TomorrowPreview date={tomorrow} />  (Client)
    ├── [LOCKED]    <PreviewCTA />
    │               └── Button "내일 피드 미리보기 👀"
    │
    ├── [WATCHING]  <FakeAdOverlay />
    │               ├── <FakeAdBanner />        // 더미 광고 콘텐츠
    │               ├── <CountdownTimer sec=5 /> // "광고 종료까지 N초"
    │               └── <ProgressBar />          // shadcn/ui Progress
    │
    └── [UNLOCKED]  <TomorrowFeedCard />
                    ├── <SectionTitle /> × 3    // title만 노출, body 숨김
                    └── <UnlockExpireNotice />   // "자정에 만료됩니다"
```

---

## TomorrowPreview 상태 머신

### 상태 전환

```
LOCKED
  │  (미리보기 버튼 클릭)
  ▼
WATCHING  ── 5000ms 경과 ──▶  UNLOCKED
                                  │  (KST 자정 이후 재방문)
                                  ▼
                               LOCKED  (localStorage 키 삭제)
```

### LocalStorage 스키마

```ts
// key: "tt_preview_2025-05-22"
type PreviewToken = {
  unlockedAt: string  // ISO 8601
  expiresAt:  string  // KST 자정의 UTC 변환값
}
```

### 만료 검증 로직

```ts
function getPreviewState(date: string): 'LOCKED' | 'UNLOCKED' {
  const raw = localStorage.getItem(`tt_preview_${date}`)
  if (!raw) return 'LOCKED'
  const { expiresAt } = JSON.parse(raw) as PreviewToken
  if (new Date(expiresAt) < new Date()) {
    localStorage.removeItem(`tt_preview_${date}`)
    return 'LOCKED'
  }
  return 'UNLOCKED'
}
```

---

## 공통 컴포넌트 (`packages/ui/`)

| 컴포넌트 | 역할 | shadcn/ui 기반 |
|----------|------|---------------|
| `<TagBadge />` | 태그 색상 뱃지 | `Badge` |
| `<DateBadge />` | 날짜 표시 | `Badge` |
| `<FeedCard />` | 아카이브 카드 | `Card` |
| `<ProgressBar />` | 광고 진행률 | `Progress` |
| `<Skeleton />` | 로딩 플레이스홀더 | `Skeleton` |

---

## 데이터 페칭 전략

| 페이지 | 전략 | 이유 |
|--------|------|------|
| `/archive` | ISR `revalidate: 3600` | 하루 1회 업데이트, 캐시로 성능 확보 |
| `/feed/[date]` | ISR `revalidate: 3600` | 동일 이유 |
| 내일 피드 (DRAFT) | `cache: 'no-store'` | 미리보기이므로 항상 최신 데이터 |
