import { describe, expect, it } from 'vitest'
import type { PaymentRepository } from '../../modules/invoices/PaymentRepository'

export function describePaymentRepositoryContract(createRepository: () => PaymentRepository): void {
  describe('PaymentRepository contract', () => {
    it('registers and voids payments, recalculating the balance', async () => {
      const repository = createRepository()
      const invoiceId = 'invoice-1' as never
      const payment = await repository.register({ invoiceId, amountMinor: 500 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })

      expect(payment).toMatchObject({ invoiceId, amountMinor: 500, isVoid: false })
      expect(await repository.findByInvoice(invoiceId)).toContainEqual(payment)
      expect(await repository.void(payment.id, 'Recorded in error')).toMatchObject({ id: payment.id, isVoid: true })
    })

    it('propagates overpayment rejection', async () => {
      const repository = createRepository()
      await expect(repository.register({ invoiceId: 'missing' as never, amountMinor: 1 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })).rejects.toThrow()
    })
  })
}
