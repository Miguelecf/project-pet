import type { InvoiceStatus, MoneyMinor } from '../types/domain'
import { validateMoneyMinor, validateQuantity } from './validation'

const THOUSANDTHS_PER_UNIT = 1_000

export interface InvoiceTotals {
  readonly subtotalMinor: MoneyMinor
  readonly taxMinor: MoneyMinor
  readonly totalMinor: MoneyMinor
}

export function roundHalfUp(value: number, scale = 100): MoneyMinor {
  if (!Number.isFinite(value) || !Number.isSafeInteger(scale) || scale <= 0) {
    throw new RangeError('Value and scale must be finite safe values')
  }

  const scaled = value * scale
  if (!Number.isSafeInteger(Math.floor(scaled))) {
    throw new RangeError('Rounded amount exceeds safe integer range')
  }

  return Math.floor(scaled + 0.5) as MoneyMinor
}

export function lineTotalMinor(quantity: number, unitCostMinor: number): MoneyMinor {
  validateQuantity(quantity)
  validateMoneyMinor(unitCostMinor)

  const quantityThousandths = Math.round(quantity * THOUSANDTHS_PER_UNIT)
  const product = quantityThousandths * unitCostMinor
  if (!Number.isSafeInteger(product)) {
    throw new RangeError('Line total exceeds safe integer arithmetic')
  }

  return (Math.floor(product / THOUSANDTHS_PER_UNIT) + (product % THOUSANDTHS_PER_UNIT >= 500 ? 1 : 0)) as MoneyMinor
}

export function invoiceTotals(lineTotalsMinor: readonly number[]): InvoiceTotals {
  const subtotalMinor = lineTotalsMinor.reduce((total, lineTotal) => {
    validateMoneyMinor(lineTotal)
    const nextTotal = total + lineTotal
    if (!Number.isSafeInteger(nextTotal)) {
      throw new RangeError('Invoice total exceeds safe integer range')
    }
    return nextTotal
  }, 0)

  return { subtotalMinor: subtotalMinor as MoneyMinor, taxMinor: 0 as MoneyMinor, totalMinor: subtotalMinor as MoneyMinor }
}

export function deriveStatus(totalMinor: number, paidMinor: number): InvoiceStatus {
  validateMoneyMinor(totalMinor)
  validateMoneyMinor(paidMinor)
  if (totalMinor === 0) {
    throw new RangeError('Invoice total must be positive')
  }
  if (paidMinor > totalMinor) {
    throw new RangeError('Payment exceeds invoice total')
  }
  if (paidMinor === 0) {
    return 'pending'
  }
  return paidMinor === totalMinor ? 'paid' : 'partially_paid'
}
