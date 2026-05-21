/** KST 기준 "오늘" 날짜의 UTC 자정 */
export function getTodayKSTMidnightUTC(): Date {
  const now = new Date()
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000
  const kstDate = new Date(kstMs)
  return new Date(
    Date.UTC(kstDate.getUTCFullYear(), kstDate.getUTCMonth(), kstDate.getUTCDate()) -
      9 * 60 * 60 * 1000
  )
}

/** KST 기준 "내일" 날짜의 UTC 자정 */
export function getTomorrowKSTMidnightUTC(): Date {
  const today = getTodayKSTMidnightUTC()
  return new Date(today.getTime() + 24 * 60 * 60 * 1000)
}

/** "YYYY-MM-DD" 문자열 → KST 해당 날의 UTC 자정 */
export function dateStringToKSTMidnightUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day) - 9 * 60 * 60 * 1000)
}
