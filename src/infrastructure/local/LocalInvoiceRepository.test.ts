import { describeInvoiceRepositoryContract } from '../../test/contracts/invoiceRepositoryContract'
import { describe, expect, it } from 'vitest'
import { LocalStateGateway } from './LocalStateGateway'
import { LocalInvoiceRepository } from './LocalInvoiceRepository'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

function createRepository() {
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
  return new LocalInvoiceRepository(gateway, {
    now: fixedNow,
    nextInvoiceId: () => `invoice-${++sequence}` as never,
    nextLineId: () => `line-${sequence}` as never,
  })
}

const fractionalInput = {
  supplierId: 'supplier-1' as never,
  docRef: 'DECIMAL-1',
  issueDate: '2026-08-10' as never,
  dueDate: null,
  currency: 'USD' as const,
  notes: null,
  lines: [{ categoryId: 'category-1' as never, productRef: 'FRACTION', externalSku: null, description: 'Fractional line', quantity: 1.255 as never, unitCostMinor: 100 as never }],
}

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

describe('LocalInvoiceRepository financial persistence', () => {
  it('persists and reloads half-up line totals for fractional create input', async () => {
    const repository = createRepository()

    const created = await repository.create(fractionalInput)
    const reloaded = await repository.findById(created.invoice.id)

    expect(created.invoice.totalMinor).toBe(126)
    expect(created.lines[0]?.lineTotalMinor).toBe(126)
    expect(reloaded).toEqual(created)
  })

  it('recomputes and round-trips half-up line totals when editing', async () => {
    const repository = createRepository()
    const created = await repository.create({ ...fractionalInput, lines: [{ ...fractionalInput.lines[0], quantity: 1 as never }] })

    const updated = await repository.update(created.invoice.id, fractionalInput)
    const reloaded = await repository.findById(created.invoice.id)

    expect(updated.invoice.totalMinor).toBe(126)
    expect(updated.lines[0]?.lineTotalMinor).toBe(126)
    expect(reloaded).toEqual(updated)
  })
})
