import cron from 'node-cron'
import { runCrawl } from '../jobs/crawl'
import { runSummarize } from '../jobs/summarize'
import { runPublish } from '../jobs/publish'

export function registerCronJobs() {
  // Stage 1: 매일 06:00 KST
  cron.schedule('0 6 * * *', async () => {
    try { await runCrawl() } catch (e) { console.error('[cron] crawl failed:', e) }
  }, { timezone: 'Asia/Seoul' })

  // Stage 2: 매일 07:00 KST
  cron.schedule('0 7 * * *', async () => {
    try { await runSummarize() } catch (e) { console.error('[cron] summarize failed:', e) }
  }, { timezone: 'Asia/Seoul' })

  // Stage 3: 매일 08:00 KST
  cron.schedule('0 8 * * *', async () => {
    try { await runPublish() } catch (e) { console.error('[cron] publish failed:', e) }
  }, { timezone: 'Asia/Seoul' })

  console.log('[cron] Daily pipeline jobs registered (KST 06:00 / 07:00 / 08:00)')
}
