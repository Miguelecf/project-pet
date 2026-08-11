import { describeInvoiceRepositoryContract } from '../../test/contracts/invoiceRepositoryContract'
import { LocalStateGateway } from './LocalStateGateway'
import { LocalInvoiceRepository } from './LocalInvoiceRepository'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeInvoiceRepositoryContract(() => {
  const storage = new MemoryStorage()
  const gateway = new LocalStateGateway(storage)
  void gateway.write({
    schemaVersion: 1,
    settings: { currency: 'USD', dueAlertDays: 7 as never, createdAt: fixedNow(), updatedAt: fixedNow() },
    suppliers: [{ id: 'supplier-1' as never, name: 'Demo Supplier', normalizedName: 'demo supplier', defaultDueDays: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() }],
    categories: [{ id: 'category-1' as never, name: 'Demo Category', normalizedName: 'demo category', createdAt: fixedNow(), updatedAt: fixedNow() }],
    invoices: [], invoiceLines: [], payments: [], dailyIncomes: [],
  })
  let sequence = 0
  let failNextUpdate = false
  const originalSetItem = storage.setItem.bind(storage)
  storage.setItem = (key, value) => {
    if (failNextUpdate) {
      failNextUpdate = false
      throw new Error('adapter write failed')
    }
    originalSetItem(key, value)
  }

  return {
    repository: new LocalInvoiceRepository(gateway, {
      now: fixedNow,
      nextInvoiceId: () => `invoice-${++sequence}` as never,
      nextLineId: () => `line-${sequence}` as never,
    }),
    failNextUpdate: () => { failNextUpdate = true },
  }
})
