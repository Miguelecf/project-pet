import { describeSettingsRepositoryContract } from '../../test/contracts/settingsRepositoryContract'
import { LocalStateGateway } from './LocalStateGateway'
import { LocalSettingsRepository } from './LocalSettingsRepository'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeSettingsRepositoryContract(() => {
  const gateway = new LocalStateGateway(new MemoryStorage())
  return {
    repository: new LocalSettingsRepository(gateway, { now: fixedNow }),
    async recordInvoice() {
      const state = gateway.read()
      state.suppliers.push({ id: 'supplier-1', name: 'Supplier', normalizedName: 'supplier', defaultDueDays: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      state.categories.push({ id: 'category-1', name: 'Category', normalizedName: 'category', createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      state.invoices.push({ id: 'invoice-1', supplierId: 'supplier-1', docRef: null, issueDate: '2020-01-01', dueDate: null, currency: 'USD', totalMinor: 1000, status: 'pending', notes: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      state.invoiceLines.push({ id: 'line-1', invoiceId: 'invoice-1', categoryId: 'category-1', productRef: 'Product', externalSku: null, description: 'Description', quantity: 1, unitCostMinor: 1000, lineTotalMinor: 1000, position: 1, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      await gateway.write(state)
    },
    async recordDailyIncome() {
      const state = gateway.read()
      state.dailyIncomes.push({ id: 'income-1', saleDate: '2020-01-01', amountMinor: 1000, currency: 'ARS', note: null, createdAt: fixedNow(), updatedAt: fixedNow() } as never)
      await gateway.write(state)
    },
  }
})
