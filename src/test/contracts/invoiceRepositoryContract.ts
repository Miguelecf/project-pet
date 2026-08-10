import { describe, expect, it } from 'vitest'
import type { InvoiceRepository } from '../../modules/invoices/InvoiceRepository'

export function describeInvoiceRepositoryContract(createRepository: () => InvoiceRepository): void {
  describe('InvoiceRepository contract', () => {
    it('creates invoices with lines and supports status and deleted queries', async () => {
      const repository = createRepository()
      const created = await repository.create({
        supplierId: 'supplier-1' as never,
        issueDate: '2026-08-10' as never,
        dueDate: null,
        currency: 'USD',
        docRef: null,
        notes: null,
        lines: [{ categoryId: 'category-1' as never, productRef: 'demo', externalSku: null, description: 'Demo line', quantity: 1 as never, unitCostMinor: 1000 as never }],
      })

      expect(created.invoice).toMatchObject({ status: 'pending', totalMinor: 1000 })
      expect(created.lines).toHaveLength(1)
      expect(await repository.findByStatus('pending')).toContainEqual(created.invoice)

      await repository.softDelete(created.invoice.id)
      expect(await repository.findAll()).not.toContainEqual(expect.objectContaining({ id: created.invoice.id }))
      expect(await repository.findDeleted()).toContainEqual(expect.objectContaining({ id: created.invoice.id }))
      expect(await repository.restore(created.invoice.id)).toMatchObject({ deletedAt: null })
    })

    it('returns null for an unknown invoice', async () => {
      expect(await createRepository().findById('missing' as never)).toBeNull()
    })
  })
}
