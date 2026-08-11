import { describe, expect, it } from 'vitest'
import type { InvoiceRepository } from '../../modules/invoices/InvoiceRepository'

export interface InvoiceContractFixture {
  readonly repository: InvoiceRepository
  failNextUpdate(): void
}

export function describeInvoiceRepositoryContract(createFixture: () => InvoiceContractFixture): void {
  describe('InvoiceRepository contract', () => {
    it('creates invoices with lines and supports status and deleted queries', async () => {
      const { repository } = createFixture()
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
      expect(await repository.findAll()).toContainEqual(expect.objectContaining({ id: created.invoice.id }))
      expect(await repository.findByStatus('pending')).toContainEqual(created.invoice)
      const updated = await repository.update(created.invoice.id, { ...{
        supplierId: 'supplier-1' as never, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', docRef: 'UPDATED-1', notes: 'Updated invoice',
      }, lines: [{ categoryId: 'category-1' as never, productRef: 'updated', externalSku: null, description: 'Updated line', quantity: 2 as never, unitCostMinor: 1000 as never }] })
      expect(updated).toMatchObject({ invoice: { docRef: 'UPDATED-1', totalMinor: 2000 }, lines: [expect.objectContaining({ productRef: 'updated' })] })
      expect(await repository.findAll()).toContainEqual(expect.objectContaining({ id: created.invoice.id, docRef: 'UPDATED-1', totalMinor: 2000 }))

      await repository.softDelete(created.invoice.id)
      expect(await repository.findAll()).not.toContainEqual(expect.objectContaining({ id: created.invoice.id }))
      expect(await repository.findDeleted()).toContainEqual(expect.objectContaining({ id: created.invoice.id }))
      expect(await repository.restore(created.invoice.id)).toMatchObject({ deletedAt: null })
      expect(await repository.findAll()).toContainEqual(expect.objectContaining({ id: created.invoice.id, deletedAt: null }))
    })

    it('returns null for unknown reads and propagates adapter update errors', async () => {
      const { failNextUpdate, repository } = createFixture()
      expect(await repository.findById('missing' as never)).toBeNull()
      const created = await repository.create({
        supplierId: 'supplier-1' as never, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', docRef: null, notes: null,
        lines: [{ categoryId: 'category-1' as never, productRef: 'demo', externalSku: null, description: 'Demo line', quantity: 1 as never, unitCostMinor: 1000 as never }],
      })
      failNextUpdate()
      await expect(repository.update(created.invoice.id, {
        supplierId: 'supplier-1' as never, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', docRef: null, notes: null,
        lines: [{ categoryId: 'category-1' as never, productRef: 'demo', externalSku: null, description: 'Demo line', quantity: 1 as never, unitCostMinor: 1000 as never }],
      })).rejects.toThrow('adapter write failed')
    })
  })
}
