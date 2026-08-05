import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  dateStringToKSTMidnightUTC,
  getTodayKSTMidnightUTC,
  getTomorrowKSTMidnightUTC,
  utcToKSTDateString,
} from './date'

describe('date', () => {
  afterEach(() => vi.useRealTimers())

  it('getTodayKSTMidnightUTC는 오늘 KST 날짜의 UTC 자정을 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-21T03:00:00.000Z'))
    expect(getTodayKSTMidnightUTC().toISOString()).toBe('2026-05-20T15:00:00.000Z')
  })

  it('getTomorrowKSTMidnightUTC는 오늘보다 24시간 뒤를 반환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-21T03:00:00.000Z'))
    expect(getTomorrowKSTMidnightUTC().toISOString()).toBe('2026-05-21T15:00:00.000Z')
  })

  it('dateStringToKSTMidnightUTC는 YYYY-MM-DD를 KST 자정의 UTC로 변환한다', () => {
    expect(dateStringToKSTMidnightUTC('2026-05-21').toISOString()).toBe(
      '2026-05-20T15:00:00.000Z'
    )
  })

  it('utcToKSTDateString은 UTC 자정 Date를 KST YYYY-MM-DD로 되돌린다', () => {
    expect(utcToKSTDateString(new Date('2026-05-20T15:00:00.000Z'))).toBe('2026-05-21')
  })

  it('UTC 15:00 정각에 KST 날짜가 다음 날로 넘어간다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T15:00:00.000Z'))
    expect(getTodayKSTMidnightUTC().toISOString()).toBe('2026-05-20T15:00:00.000Z')
  })

  it('UTC 15:00 직전에는 KST 날짜가 아직 당일이다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T14:59:59.999Z'))
    expect(getTodayKSTMidnightUTC().toISOString()).toBe('2026-05-19T15:00:00.000Z')
  })

  it('연초 날짜는 전년도 12월 31일 15:00 UTC로 변환된다', () => {
    expect(dateStringToKSTMidnightUTC('2026-01-01').toISOString()).toBe(
      '2025-12-31T15:00:00.000Z'
    )
  })
})
