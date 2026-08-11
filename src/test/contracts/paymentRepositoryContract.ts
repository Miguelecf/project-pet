import { describe, expect, it } from 'vitest'
import type { PaymentRepository } from '../../modules/invoices/PaymentRepository'
import type { InvoiceRepository } from '../../modules/invoices/InvoiceRepository'
import type { InvoiceId, MoneyMinor } from '../../types/domain'

export interface PaymentContractFixture {
  readonly repository: PaymentRepository
  readonly invoiceRepository: InvoiceRepository
  createInvoice(totalMinor: MoneyMinor): Promise<InvoiceId>
}

export function describePaymentRepositoryContract(createFixture: () => PaymentContractFixture): void {
  describe('PaymentRepository contract', () => {
    it('persists partial, complete, and voided payment balance and status transitions', async () => {
      const { createInvoice, invoiceRepository, repository } = createFixture()
      const invoiceId = await createInvoice(1000 as never)
      const payment = await repository.register({ invoiceId, amountMinor: 600 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })

      expect(payment).toMatchObject({ invoiceId, amountMinor: 600, isVoid: false })
      expect(await repository.findByInvoice(invoiceId)).toContainEqual(payment)
      expect(await repository.getBalance(invoiceId)).toEqual({ remainingMinor: 400, status: 'partially_paid' })
      expect(await invoiceRepository.findById(invoiceId)).toMatchObject({ invoice: { totalMinor: 1000, status: 'partially_paid' } })
      await expect(repository.register({ invoiceId, amountMinor: 401 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })).rejects.toThrow('overpayment')
      const remainder = await repository.register({ invoiceId, amountMinor: 400 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })
      expect(await repository.getBalance(invoiceId)).toEqual({ remainingMinor: 0, status: 'paid' })
      expect(await invoiceRepository.findById(invoiceId)).toMatchObject({ invoice: { totalMinor: 1000, status: 'paid' } })
      const voided = await repository.void(payment.id, 'Recorded in error')
      expect(voided).toMatchObject({ id: payment.id, isVoid: true, voidReason: 'Recorded in error', voidedAt: '2026-08-10T00:00:00.000Z' })
      expect(await repository.findByInvoice(invoiceId)).toContainEqual(expect.objectContaining({
        id: payment.id,
        isVoid: true,
        voidReason: 'Recorded in error',
        voidedAt: '2026-08-10T00:00:00.000Z',
      }))
      expect(await repository.findByInvoice(invoiceId)).toContainEqual(expect.objectContaining({ id: remainder.id, isVoid: false }))
      expect(await repository.getBalance(invoiceId)).toEqual({ remainingMinor: 600, status: 'partially_paid' })
      expect(await invoiceRepository.findById(invoiceId)).toMatchObject({ invoice: { totalMinor: 1000, status: 'partially_paid' } })
    })

    it('propagates overpayment rejection before any payment exists', async () => {
      const { createInvoice, repository } = createFixture()
      const invoiceId = await createInvoice(1000 as never)
      await expect(repository.register({ invoiceId, amountMinor: 1001 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })).rejects.toThrow()
    })
  })
}
