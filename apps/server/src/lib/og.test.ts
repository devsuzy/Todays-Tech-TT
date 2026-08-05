import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchOgImage } from './og'

const fetchMock = vi.fn()

describe('fetchOgImage', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('property가 앞에 오는 og:image에서 절대 URL을 추출한다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '<meta property="og:image" content="https://cdn.example.com/a.png" />',
    })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBe(
      'https://cdn.example.com/a.png'
    )
  })

  it('content가 앞에 오는 역순 og:image도 추출한다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '<meta content="https://cdn.example.com/b.png" property="og:image" />',
    })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBe(
      'https://cdn.example.com/b.png'
    )
  })

  it('name="og:image" 변형도 추출한다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '<meta name="og:image" content="https://cdn.example.com/c.png" />',
    })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBe(
      'https://cdn.example.com/c.png'
    )
  })

  it('프로토콜 상대 경로에 https를 붙인다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '<meta property="og:image" content="//cdn.example.com/a.png" />',
    })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBe(
      'https://cdn.example.com/a.png'
    )
  })

  it('루트 상대 경로에 요청 URL의 origin을 붙인다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '<meta property="og:image" content="/img/a.png" />',
    })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBe(
      'https://blog.example.com/img/a.png'
    )
  })

  it('og:image 태그가 없으면 null을 반환한다', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '<html><head><title>글</title></head></html>',
    })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBeNull()
  })

  it('응답이 ok가 아니면 null을 반환한다', async () => {
    fetchMock.mockResolvedValue({ ok: false, text: async () => '' })
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBeNull()
  })

  it('fetch가 실패하면 null을 반환한다', async () => {
    fetchMock.mockRejectedValue(new Error('network error'))
    expect(await fetchOgImage('https://blog.example.com/posts/1')).toBeNull()
  })
})
