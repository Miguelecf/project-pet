import { describe, expect, it } from 'vitest'

import { deriveStatus, invoiceTotals, lineTotalMinor, roundHalfUp } from './finance'

describe('lineTotalMinor', () => {
  it.each([
    [3, 1500, 4500],
    [1.255, 100, 126],
    [10_000, 5, 50_000],
    [0.005, 100, 1],
    [9_007_199_254.74, 1, 9_007_199_255],
  ])('calculates %s × %s as %s minor units without floating-point drift', (quantity, unitCostMinor, expected) => {
    expect(lineTotalMinor(quantity, unitCostMinor)).toBe(expected)
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.0001])('rejects invalid quantity %s', (quantity) => {
    expect(() => lineTotalMinor(quantity, 100)).toThrow()
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])('rejects invalid minor-unit cost %s', (unitCostMinor) => {
    expect(() => lineTotalMinor(1, unitCostMinor)).toThrow()
  })

  it('rejects products that exceed safe-integer arithmetic', () => {
    expect(() => lineTotalMinor(Number.MAX_SAFE_INTEGER / 1_000, 2)).toThrow()
  })

  it('is deterministic across repeated calls', () => {
    expect(Array.from({ length: 100 }, () => lineTotalMinor(7, 333))).toEqual(Array(100).fill(2331))
  })
})

describe('roundHalfUp', () => {
  it.each([[0.005, 1], [1.234, 123], [1.235, 124]])('rounds major-unit values half-up to minor units', (value, expected) => {
    expect(roundHalfUp(value)).toBe(expected)
  })
})

describe('invoiceTotals', () => {
  it('sums already-rounded line totals with no tax by default', () => {
    expect(invoiceTotals([4500, 2000, 1500])).toEqual({ subtotalMinor: 8000, taxMinor: 0, totalMinor: 8000 })
  })

  it('returns zero totals for an empty invoice', () => {
    expect(invoiceTotals([])).toEqual({ subtotalMinor: 0, taxMinor: 0, totalMinor: 0 })
  })

  it('rejects invalid line totals and unsafe sums', () => {
    expect(() => invoiceTotals([1.5])).toThrow()
    expect(() => invoiceTotals([Number.MAX_SAFE_INTEGER, 1])).toThrow()
  })
})

describe('deriveStatus', () => {
  it.each([
    [10_000, 0, 'pending'],
    [10_000, 5000, 'partially_paid'],
    [10_000, 10_000, 'paid'],
  ] as const)('derives %s total with %s paid as %s', (totalMinor, paidMinor, expected) => {
    expect(deriveStatus(totalMinor, paidMinor)).toBe(expected)
  })

  it('rejects overpayment and invalid money amounts', () => {
    expect(() => deriveStatus(10_000, 12_000)).toThrow()
    expect(() => deriveStatus(0, 0)).toThrow()
    expect(() => deriveStatus(10_000, -1)).toThrow()
    expect(() => deriveStatus(10_000.5, 0)).toThrow()
  })
})
