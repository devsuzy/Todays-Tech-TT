import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('여러 클래스명을 공백으로 합친다', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('falsy 값은 제외한다', () => {
    expect(cn('flex', false, undefined, null, 'gap-2')).toBe('flex gap-2')
  })

  it('충돌하는 tailwind 클래스는 뒤의 것이 이긴다', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
