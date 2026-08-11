import { describe, expect, it } from 'vitest'
import type { PaymentRepository } from '../../modules/invoices/PaymentRepository'
import type { InvoiceId, InvoiceStatus, MoneyMinor } from '../../types/domain'

export interface PaymentContractFixture {
  readonly repository: PaymentRepository
  createInvoice(totalMinor: MoneyMinor): Promise<InvoiceId>
  getBalance(invoiceId: InvoiceId): Promise<{ readonly remainingMinor: MoneyMinor; readonly status: InvoiceStatus }>
}

export function describePaymentRepositoryContract(createFixture: () => PaymentContractFixture): void {
  describe('PaymentRepository contract', () => {
    it('registers and voids payments, recalculating the balance', async () => {
      const { createInvoice, getBalance, repository } = createFixture()
      const invoiceId = await createInvoice(1000 as never)
      const payment = await repository.register({ invoiceId, amountMinor: 600 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })

      expect(payment).toMatchObject({ invoiceId, amountMinor: 600, isVoid: false })
      expect(await repository.findByInvoice(invoiceId)).toContainEqual(payment)
      expect(await getBalance(invoiceId)).toEqual({ remainingMinor: 400, status: 'partially_paid' })
      const voided = await repository.void(payment.id, 'Recorded in error')
      expect(voided).toMatchObject({ id: payment.id, isVoid: true })
      expect(await getBalance(invoiceId)).toEqual({ remainingMinor: 1000, status: 'pending' })
    })

    it('propagates overpayment rejection', async () => {
      const { createInvoice, repository } = createFixture()
      const invoiceId = await createInvoice(1000 as never)
      await expect(repository.register({ invoiceId, amountMinor: 1001 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })).rejects.toThrow()
    })
  })
}
