/** KST = UTC+9 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** KST 기준 연·월·일(month는 0-based) → 그 날 KST 자정의 UTC 시각 */
function toKSTMidnightUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - KST_OFFSET_MS)
}

/** KST 기준 "오늘" 날짜의 UTC 자정 */
export function getTodayKSTMidnightUTC(): Date {
  // UTC 시각에 +9h를 더하면 각 UTC 필드가 곧 KST의 연·월·일이 된다
  const kstNow = new Date(Date.now() + KST_OFFSET_MS)
  return toKSTMidnightUTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate())
}

/** KST 기준 "내일" 날짜의 UTC 자정 */
export function getTomorrowKSTMidnightUTC(): Date {
  return new Date(getTodayKSTMidnightUTC().getTime() + DAY_MS)
}

/** "YYYY-MM-DD" 문자열 → KST 해당 날의 UTC 자정 */
export function dateStringToKSTMidnightUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return toKSTMidnightUTC(year, month - 1, day)
}

/** UTC 자정으로 저장된 Date → KST 기준 "YYYY-MM-DD" 문자열 */
export function utcToKSTDateString(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10)
}
