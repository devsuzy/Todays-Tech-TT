import express from 'express'
import cors from 'cors'
import feedsRouter from './routes/feeds'
import tagsRouter from './routes/tags'
import { registerCronJobs } from './cron/dailyPipeline'
import { runCatchUpIfNeeded } from './jobs/catchup'

const app = express()
const PORT = process.env.PORT ?? 4000

app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/v1/feeds', feedsRouter)
app.use('/api/v1/tags', tagsRouter)

app.listen(PORT, async () => {
  console.log(`[server] Listening on http://localhost:${PORT}`)
  registerCronJobs()
  await runCatchUpIfNeeded()
})
