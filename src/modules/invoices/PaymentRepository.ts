import type { ActivePayment, InvoiceId, ISODate, MoneyMinor, Payment, PaymentId, PaymentMethod, VoidedPayment } from '../../types/domain'

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
  register(input: RegisterPaymentInput): Promise<ActivePayment>
  void(id: PaymentId, reason: string): Promise<VoidedPayment>
}
