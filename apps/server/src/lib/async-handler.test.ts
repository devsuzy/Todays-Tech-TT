import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { asyncHandler } from './async-handler'

const mockRes = (headersSent = false) => {
  const res = { headersSent, status: vi.fn(), json: vi.fn() }
  res.status.mockReturnValue(res)
  return res
}

const flush = () => new Promise<void>((r) => setImmediate(r))

describe('asyncHandler', () => {
  it('핸들러가 정상 완료하면 next를 호출하지 않는다', async () => {
    const res = mockRes()
    const next = vi.fn()

    asyncHandler(async (_req, r) => r.json({ ok: true }))(
      {} as Request,
      res as unknown as Response,
      next as unknown as NextFunction
    )
    await flush()

    expect(next).not.toHaveBeenCalled()
  })

  it('핸들러가 reject하면 500 INTERNAL_ERROR로 응답한다', async () => {
    const res = mockRes()

    asyncHandler(async () => {
      throw new Error('db down')
    })({} as Request, res as unknown as Response, vi.fn() as unknown as NextFunction)
    await flush()

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'INTERNAL_ERROR' })
  })

  it('이미 응답을 보낸 뒤 reject하면 next에 에러를 넘긴다', async () => {
    const res = mockRes(true)
    const next = vi.fn()
    const err = new Error('too late')

    asyncHandler(async () => {
      throw err
    })({} as Request, res as unknown as Response, next as unknown as NextFunction)
    await flush()

    expect(next).toHaveBeenCalledWith(err)
    expect(res.status).not.toHaveBeenCalled()
  })
})
