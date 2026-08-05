import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatKSTDate,
  formatKSTDateLong,
  getKSTMidnightUTC,
  getTodayKSTString,
  getTomorrowKSTString,
  toKSTDateString,
} from '@/lib/date-utils'

describe('date-utils', () => {
  afterEach(() => vi.useRealTimers())

  it('formatKSTDate는 UTC 자정을 KST 카드 포맷으로 변환한다', () => {
    expect(formatKSTDate('2026-05-20T15:00:00.000Z')).toBe('2026.05.21 (목)')
  })

  it('formatKSTDateLong은 한국어 긴 포맷으로 변환한다', () => {
    expect(formatKSTDateLong('2026-05-20T15:00:00.000Z')).toBe('2026년 5월 21일 (목)')
  })

  it('toKSTDateString은 UTC ISO를 KST YYYY-MM-DD로 변환한다', () => {
    expect(toKSTDateString('2026-05-20T15:00:00.000Z')).toBe('2026-05-21')
  })

  it('getTodayKSTString은 오늘 KST 날짜를 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-21T03:00:00.000Z'))
    expect(getTodayKSTString()).toBe('2026-05-21')
  })

  it('getTomorrowKSTString은 내일 KST 날짜를 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-21T03:00:00.000Z'))
    expect(getTomorrowKSTString()).toBe('2026-05-22')
  })

  it('getKSTMidnightUTC는 YYYY-MM-DD를 KST 자정의 UTC로 변환한다', () => {
    expect(getKSTMidnightUTC('2026-05-21').toISOString()).toBe('2026-05-20T15:00:00.000Z')
  })

  it('getKSTMidnightUTC는 연초 날짜를 전년도 12월 31일 15:00 UTC로 변환한다', () => {
    expect(getKSTMidnightUTC('2026-01-01').toISOString()).toBe('2025-12-31T15:00:00.000Z')
  })

  it('formatKSTDate는 한 자리 월/일을 0으로 채운다', () => {
    expect(formatKSTDate('2026-01-04T15:00:00.000Z')).toBe('2026.01.05 (월)')
  })

  it('formatKSTDateLong은 한 자리 월/일을 0으로 채우지 않는다', () => {
    expect(formatKSTDateLong('2026-01-04T15:00:00.000Z')).toBe('2026년 1월 5일 (월)')
  })

  it('getTomorrowKSTString은 월말에 다음 달로 넘어간다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T03:00:00.000Z'))
    expect(getTomorrowKSTString()).toBe('2026-06-01')
  })
})
