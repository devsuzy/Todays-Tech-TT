### p0 (필수, 핵심 기능, 2주 내 완성)
- [x] 백엔드 스케줄러 & AI 크롤러
- [x] UI - 피드 레이아웃, 반응형
- [x] UI - 아카이브 레이아웃, 반응형
- [x] 기술 태그 필터링
- [x] 검색 기능

### p1 (2주 기간 내 도전)
- [x] 내일 피드 미리보기 (비회원용 로컬 제한 방식)
  - [x] 로컬 스토리지를 활용한 '내일 피드 미리보기(가짜 광고)' 인터랙션 추가
  - [x] 내일 피드 카드: 타이틀, 출처 표시
  - [x] 내일 피드 카드 클릭 시 피드 상세보기 페이지로 이동
  - [x] 금일 기준으로 내일 피드는 미리 파서 해둘 것
  - [x] 내일 피드는 금일 아카이브에 뜨지 않음
- [] Slack Bot 생성하기
  - [x] API — POST /api/v1/slack/subscribe, DELETE /api/v1/slack/unsubscribe
  - [x] 백엔드 — slack-notify.ts 알림 발송 Job (매일 09:00 KST cron 등록)
  - [x] UI — 헤더 벨 아이콘 클릭 시 Popover로 구독 폼 표시 (BellPopover + SlackSubscribeCard)
  - [] ⚠️ 서버 배포 후 진행: SITE_URL 환경변수 설정 (Slack 메시지 내 피드 링크용)
  - [] ⚠️ 서버 배포 후 진행: 실제 Slack Webhook URL 연결 및 발송 테스트
- [] 서버 배포
  - [] Supabase — 프로젝트 생성 & Transaction pooler URI 복사 (리전: Northeast Asia)
  - [] Railway — GitHub repo 연결 & 환경변수 7개 입력 (DATABASE_URL, OPENAI_API_KEY, PORT, WEB_ORIGIN, SITE_URL, TZ, NODE_ENV)
  - [] Railway — 빌드 & 배포 확인 (Prisma migrate 자동 실행, /health 응답 확인)
  - [] Railway — DB 시드 실행: `node apps/server/dist/prisma/seed.js`
  - [] Vercel — GitHub repo 연결, Root Directory: apps/web, NEXT_PUBLIC_API_BASE_URL 설정
  - [] Vercel — 배포 완료 후 도메인 확인 → Railway WEB_ORIGIN, SITE_URL 업데이트 & Redeploy
  - [] 크론잡 동작 확인 (Railway 로그에서 KST 06~09시 파이프라인 실행 여부)
  - [] Slack 구독 테스트 — 실 Webhook URL로 구독 등록 후 발송 확인

### p2 (추후 고도화/백로그, 1차 출시 이후)
- [] 회원가입 및 로그인 기능 (OAuth 2.0)
- [] 유저별 북마크(찜하기) 및 마이페이지
- [] 실제 배너 광고 SDK (구글 애드센스 등) 탑재 및 수익화
- [] 슬랙 봇(Slack Bot)과의 양방향 인터랙션 기능