import type { ActivePayment, InvoiceId, ISODate, InvoiceStatus, MoneyMinor, Payment, PaymentId, PaymentMethod, VoidedPayment } from '../../types/domain'

export interface RegisterPaymentInput {
  readonly invoiceId: InvoiceId
  readonly amountMinor: MoneyMinor
  readonly paymentDate: ISODate
  readonly method: PaymentMethod
  readonly reference: string | null
  readonly notes: string | null
}

export interface PaymentRepository {
  findByInvoice(invoiceId: InvoiceId): Promise<readonly Payment[]>
  getBalance(invoiceId: InvoiceId): Promise<{ readonly remainingMinor: MoneyMinor; readonly status: InvoiceStatus }>
  register(input: RegisterPaymentInput): Promise<ActivePayment>
  void(id: PaymentId, reason: string): Promise<VoidedPayment>
}
