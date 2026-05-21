import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/v1/tags
router.get('/', async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
  res.json(tags)
})

export default router
