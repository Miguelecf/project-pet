import { describeDailyIncomeRepositoryContract } from '../../test/contracts/dailyIncomeRepositoryContract'
import { LocalDailyIncomeRepository } from './LocalDailyIncomeRepository'
import { LocalStateGateway } from './LocalStateGateway'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeDailyIncomeRepositoryContract(() => {
  const gateway = new LocalStateGateway(new MemoryStorage())
  void gateway.write({
    schemaVersion: 1,
    settings: { currency: 'USD', dueAlertDays: 7 as never, createdAt: fixedNow(), updatedAt: fixedNow() },
    suppliers: [], categories: [], invoices: [], invoiceLines: [], payments: [], dailyIncomes: [],
  })
  let sequence = 0
  return new LocalDailyIncomeRepository(gateway, { now: fixedNow, nextId: () => `income-${++sequence}` as never })
})
