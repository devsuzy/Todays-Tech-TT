## apps/server

### 일일 파이프라인 (node-cron, KST 기준)

```
06:00 crawl.ts   — RSS 수집 → Article 저장 (guid 중복 제거)
07:00 summarize.ts — 미처리 Article 선정 → gpt-4o-mini 요약 → Feed(DRAFT) + FeedSection×3 저장
08:00 publish.ts   — 오늘 날짜 DRAFT → PUBLISHED
```

각 job은 독립 실행 가능 (`npm run crawl` 등). `src/cron/dailyPipeline.ts`가 스케줄 등록.

### 날짜 처리 규칙 (중요)

Feed `date` 컬럼은 **UTC 자정**으로 저장됩니다. KST 자정 = UTC-9h.

- 예: KST 2026-05-21 → DB에 `2026-05-20T15:00:00.000Z` 저장
- `src/lib/date.ts`의 헬퍼 함수만 사용할 것:
  - `getTodayKSTMidnightUTC()` — 오늘 KST 날짜에 해당하는 UTC 자정
  - `dateStringToKSTMidnightUTC("YYYY-MM-DD")` — URL 날짜 파라미터 → DB 조회용 UTC

### API 라우터

| Path | 설명 |
|------|------|
| `GET /api/v1/feeds` | PUBLISHED 목록 (`?tag=react` 필터 가능) |
| `GET /api/v1/feeds/today` | 오늘 피드 |
| `GET /api/v1/feeds/tomorrow` | 내일 DRAFT (미리보기용) |
| `GET /api/v1/feeds/:date` | 날짜별 상세 (`YYYY-MM-DD`) |
| `GET /api/v1/tags` | 전체 태그 목록 |

Express 라우터에서 `/tomorrow`, `/today` 경로가 `/:date` 보다 먼저 등록되어야 합니다 (현재 유지 중).