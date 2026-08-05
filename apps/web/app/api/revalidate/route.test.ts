import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/revalidate/route'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const requestWithSecret = (secret: string | null) =>
  ({
    headers: { get: (key: string) => (key === 'x-revalidate-secret' ? secret : null) },
  }) as unknown as NextRequest

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('REVALIDATE_SECRET', 'test-secret')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('secret이 일치하면 200과 revalidated true를 반환한다', async () => {
    const res = await POST(requestWithSecret('test-secret'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ revalidated: true })
  })

  it('secret이 일치하면 홈과 아카이브 경로를 재검증한다', async () => {
    await POST(requestWithSecret('test-secret'))
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([
      ['/', 'page'],
      ['/archive', 'page'],
    ])
  })

  it('secret이 틀리면 401을 반환한다', async () => {
    const res = await POST(requestWithSecret('wrong-secret'))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('secret이 틀리면 재검증하지 않는다', async () => {
    await POST(requestWithSecret('wrong-secret'))
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('secret 헤더가 없으면 401을 반환한다', async () => {
    const res = await POST(requestWithSecret(null))
    expect(res.status).toBe(401)
  })
})
