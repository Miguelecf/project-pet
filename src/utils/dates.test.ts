import { describe, expect, it } from 'vitest'

import { isFuture, validateISODate, type Clock } from './dates'

const clock: Clock = { today: () => '2026-08-10' as never }

describe('validateISODate', () => {
  it.each(['2026-08-10', '2024-02-29'])('accepts strict calendar ISO date %s', (value) => {
    expect(validateISODate(value, clock)).toBe(value)
  })

  it.each(['2026-8-10', '2026-02-29', '2026-13-01', '2026-01-32', '2026-08-10T00:00:00Z'])('rejects malformed or impossible ISO date %s', (value) => {
    expect(() => validateISODate(value, clock)).toThrow()
  })

  it.each(['issue', 'payment', 'sale'] as const)('rejects a future %s date', (kind) => {
    expect(() => validateISODate('2026-08-11', clock, { kind })).toThrow()
  })

  it('allows a future due date', () => {
    expect(validateISODate('2026-08-11', clock, { kind: 'due' })).toBe('2026-08-11')
  })
})

describe('isFuture', () => {
  it('uses the injected clock at the today boundary', () => {
    expect(isFuture('2026-08-10', clock)).toBe(false)
    expect(isFuture('2026-08-11', clock)).toBe(true)
  })

  it('rejects invalid dates instead of comparing malformed text', () => {
    expect(() => isFuture('2026-02-29', clock)).toThrow()
  })
})
