const KST_DAYS = ['일', '월', '화', '수', '목', '금', '토']

function kstComponents(dateStr: string) {
  const kst = new Date(new Date(dateStr).getTime() + 9 * 60 * 60 * 1000)
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
  const kst = new Date(new Date(dateStr).getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

export function getTodayKSTString(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

export function getTomorrowKSTString(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  kst.setUTCDate(kst.getUTCDate() + 1)
  return kst.toISOString().slice(0, 10)
}
