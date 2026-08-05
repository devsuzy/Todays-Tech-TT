import cron from 'node-cron'
import { runCrawl } from '../jobs/crawl'
import { runSummarize } from '../jobs/summarize'
import { runPublish } from '../jobs/publish'
import { runSlackNotify } from '../jobs/slack-notify'

/** 한 단계가 실패해도 다음 날 스케줄은 계속 돌도록 job 안에서 에러를 삼킨다 */
function scheduleDaily(expression: string, name: string, job: () => Promise<unknown>) {
  cron.schedule(expression, async () => {
    try { await job() } catch (e) { console.error(`[cron] ${name} failed:`, e) }
  }, { timezone: 'Asia/Seoul' })
}

export function registerCronJobs() {
  scheduleDaily('0 6 * * *', 'crawl', runCrawl)              // Stage 1: 매일 06:00 KST
  scheduleDaily('0 7 * * *', 'summarize', runSummarize)      // Stage 2: 매일 07:00 KST
  scheduleDaily('0 8 * * *', 'publish', runPublish)          // Stage 3: 매일 08:00 KST
  scheduleDaily('0 9 * * *', 'slack-notify', runSlackNotify) // Stage 4: 매일 09:00 KST

  console.log('[cron] Daily pipeline jobs registered (KST 06:00 / 07:00 / 08:00 / 09:00)')
}
