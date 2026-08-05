const KST_DAYS = ['일', '월', '화', '수', '목', '금', '토']
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

// UTC 시각을 KST 벽시계로 옮긴 Date (반드시 getUTC*/toISOString으로 읽을 것)
function toKSTDate(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS)
}

function kstComponents(dateStr: string) {
  const kst = toKSTDate(new Date(dateStr))
  return {
    y: kst.getUTCFullYear(),
    m: kst.getUTCMonth() + 1,
    d: kst.getUTCDate(),
    dow: KST_DAYS[kst.getUTCDay()],
  }
}

export function formatKSTDate(dateStr: string): string {
  const { y, m, d, dow } = kstComponents(dateStr)
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${dow})`
}

export function formatKSTDateLong(dateStr: string): string {
  const { y, m, d, dow } = kstComponents(dateStr)
  return `${y}년 ${m}월 ${d}일 (${dow})`
}

export function toKSTDateString(dateStr: string): string {
  return toKSTDate(new Date(dateStr)).toISOString().slice(0, 10)
}

export function getTodayKSTString(): string {
  return toKSTDate(new Date()).toISOString().slice(0, 10)
}

export function getTomorrowKSTString(): string {
  const kst = toKSTDate(new Date())
  kst.setUTCDate(kst.getUTCDate() + 1)
  return kst.toISOString().slice(0, 10)
}

// KST 자정(00:00)은 UTC 기준 전날 15:00
export function getKSTMidnightUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day) - KST_OFFSET_MS)
}
