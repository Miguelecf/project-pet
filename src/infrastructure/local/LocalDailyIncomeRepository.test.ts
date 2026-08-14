import { describeDailyIncomeRepositoryContract } from '../../test/contracts/dailyIncomeRepositoryContract'
import { describe, expect, it } from 'vitest'
import { LocalDailyIncomeRepository } from './LocalDailyIncomeRepository'
import { LocalStateGateway } from './LocalStateGateway'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

function createRepository() {
  const gateway = new LocalStateGateway(new MemoryStorage())
  void gateway.write({
    schemaVersion: 1,
    settings: null,
    suppliers: [], categories: [], invoices: [], invoiceLines: [], payments: [], dailyIncomes: [],
  })
  let sequence = 0
  return new LocalDailyIncomeRepository(gateway, { now: fixedNow, nextId: () => `income-${++sequence}` as never })
}

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

describe('LocalDailyIncomeRepository edge cases', () => {
  it('uses the ARS fallback, sorts newest first, and rejects missing updates and deletes', async () => {
    const repository = createRepository()
    const older = await repository.create({ saleDate: '2026-08-09' as never, amountMinor: 100 as never, note: null })
    const newer = await repository.create({ saleDate: '2026-08-10' as never, amountMinor: 200 as never, note: null })

    expect(older.currency).toBe('ARS')
    expect((await repository.findAll()).map((income) => income.id)).toEqual([newer.id, older.id])
    await expect(repository.update('missing' as never, { saleDate: '2026-08-08' as never, amountMinor: 300 as never, note: null })).rejects.toThrow('daily income not found')
    await expect(repository.delete('missing' as never)).rejects.toThrow('daily income not found')
  })

  it('uses generated defaults when no clock or ID generator is injected', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.write({ schemaVersion: 1, settings: null, suppliers: [], categories: [], invoices: [], invoiceLines: [], payments: [], dailyIncomes: [] })
    const repository = new LocalDailyIncomeRepository(gateway)

    const income = await repository.create({ saleDate: '2026-08-10' as never, amountMinor: 100 as never, note: null })

    expect(income.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(income.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
