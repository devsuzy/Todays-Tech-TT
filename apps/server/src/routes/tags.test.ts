import express from 'express'
import type { Server } from 'node:http'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../lib/prisma'
import router from './tags'

vi.mock('../lib/prisma', () => ({
  prisma: {
    tag: { findMany: vi.fn() },
  },
}))

describe('tags router', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    const app = express()
    app.use(express.json())
    app.use('/api/v1/tags', router)
    server = app.listen(0)
    await new Promise<void>((r) => server.once('listening', () => r()))
    const addr = server.address() as { port: number }
    baseUrl = `http://127.0.0.1:${addr.port}`
  })

  afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()))
  })

  beforeEach(() => vi.clearAllMocks())

  it('GET /는 태그 목록을 200으로 반환한다', async () => {
    vi.mocked(prisma.tag.findMany).mockResolvedValue([
      { id: 1, name: 'React', slug: 'react', color: '#61dafb' },
    ] as any)

    const res = await fetch(`${baseUrl}/api/v1/tags`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([
      { id: 1, name: 'React', slug: 'react', color: '#61dafb' },
    ])
  })

  it('GET /는 이름 오름차순으로 정렬해 조회한다', async () => {
    vi.mocked(prisma.tag.findMany).mockResolvedValue([] as any)

    await fetch(`${baseUrl}/api/v1/tags`)
    expect(vi.mocked(prisma.tag.findMany)).toHaveBeenCalledWith({ orderBy: { name: 'asc' } })
  })
})
