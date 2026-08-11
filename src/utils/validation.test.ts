import { describe, expect, it } from 'vitest'

import { validateMoneyMinor, validateNonEmpty, validateQuantity } from './validation'

describe('validateQuantity', () => {
  it.each([1, 1.255, 10_000])('accepts positive finite quantities with at most three decimals: %s', (value) => {
    expect(validateQuantity(value)).toBe(value)
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1.0001])('rejects invalid quantity %s', (value) => {
    expect(() => validateQuantity(value)).toThrow()
  })
})

describe('validateMoneyMinor', () => {
  it.each([0, 1, Number.MAX_SAFE_INTEGER])('accepts non-negative safe integer %s', (value) => {
    expect(validateMoneyMinor(value)).toBe(value)
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])('rejects invalid minor amount %s', (value) => {
    expect(() => validateMoneyMinor(value)).toThrow()
  })
})

describe('validateNonEmpty', () => {
  it('trims and returns non-empty text', () => {
    expect(validateNonEmpty('  pet food  ')).toBe('pet food')
  })

  it.each(['', '   '])('rejects blank text %j', (value) => {
    expect(() => validateNonEmpty(value)).toThrow()
  })
})
