import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatKSTDate(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'yyyy.MM.dd (EEE)', { locale: ko })
}

export function formatKSTDateLong(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko })
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
