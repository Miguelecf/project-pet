import type { InvoiceStatus, Payment } from '../../types/domain'
import { deriveStatus } from '../../utils/finance'

export function derivedInvoiceStatus(totalMinor: number, payments: readonly Payment[]): InvoiceStatus {
  const paidMinor = payments.filter((payment) => !payment.isVoid).reduce((total, payment) => total + (payment.amountMinor as number), 0)
  return deriveStatus(totalMinor, paidMinor)
}

export function statusLabel(status: InvoiceStatus): string {
  return status === 'partially_paid' ? 'Partially paid' : status[0].toUpperCase() + status.slice(1)
}
