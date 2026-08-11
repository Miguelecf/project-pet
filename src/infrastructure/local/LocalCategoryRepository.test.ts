import { describeCategoryRepositoryContract } from '../../test/contracts/categoryRepositoryContract'
import { LocalCategoryRepository } from './LocalCategoryRepository'
import { LocalStateGateway } from './LocalStateGateway'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeCategoryRepositoryContract(() => {
  const gateway = new LocalStateGateway(new MemoryStorage())
  return {
    repository: new LocalCategoryRepository(gateway, { now: fixedNow, nextId: () => 'category-1' as never }),
    async createInvoiceLineReference(categoryId) {
      const state = gateway.read()
      state.suppliers.push({ id: 'supplier-1', name: 'Supplier', normalizedName: 'supplier', defaultDueDays: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      state.invoices.push({ id: 'invoice-1', supplierId: 'supplier-1', docRef: null, issueDate: '2020-01-01', dueDate: null, currency: 'USD', totalMinor: 1000, status: 'pending', notes: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      state.invoiceLines.push({ id: 'line-1', invoiceId: 'invoice-1', categoryId, productRef: 'Product', externalSku: null, description: 'Description', quantity: 1, unitCostMinor: 1000, lineTotalMinor: 1000, position: 1, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      await gateway.write(state)
    },
  }
})
