@AGENTS.md

## apps/web

### Next.js 16 — 중요한 Breaking Change

`params`와 `searchParams`가 **Promise**입니다. 반드시 `await` 필요:

```typescript
// app/feed/[date]/page.tsx
const { date } = await params   // ✅
const date = params.date        // ❌ 타입 에러
```

### 날짜 처리 규칙

`lib/date-utils.ts`의 헬퍼만 사용할 것:
- `toKSTDateString(dateStr)` — DB의 UTC ISO 문자열 → KST `YYYY-MM-DD` (URL용)
  - `.slice(0, 10)` 직접 사용 금지: UTC 날짜를 잘라내면 KST와 하루 차이 발생
- `formatKSTDate(dateStr)` — 카드용 날짜 포맷 (`2026.05.21 (목)`)
- `formatKSTDateLong(dateStr)` — 상세 페이지 헤더용

### 데이터 페칭

`lib/api.ts`의 함수로만 서버 호출. ISR revalidate:
- 피드 목록/상세: `{ next: { revalidate: 3600 } }` (1시간)
- 태그 목록: `{ next: { revalidate: 86400 } }` (1일)
- 내일 피드: `{ cache: 'no-store' }` (캐시 없음)

### 외부 이미지

`next.config.ts`에 `remotePatterns: [{ protocol: 'https', hostname: '**' }]` 설정됨 — `<Image>` 컴포넌트로 모든 https 이미지 허용.
