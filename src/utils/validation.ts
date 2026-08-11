import type { MoneyMinor, NonEmptyString, Quantity } from '../types/domain'

export function validateQuantity(value: number): Quantity {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError('Quantity must be a positive finite number')
  }

  const thousandths = value * 1_000
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(thousandths)) * 4
  if (!Number.isSafeInteger(Math.round(thousandths)) || Math.abs(thousandths - Math.round(thousandths)) > tolerance) {
    throw new RangeError('Quantity must have at most three decimal places')
  }

  return value as Quantity
}

export function validateMoneyMinor(value: number): MoneyMinor {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Money minor amount must be a non-negative safe integer')
  }

  return value as MoneyMinor
}

export function validateNonEmpty(value: string): NonEmptyString {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new RangeError('Value must not be empty')
  }

  return trimmed as NonEmptyString
}
