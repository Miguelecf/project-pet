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
  const repository = new LocalInvoiceRepository(gateway, {
    now: fixedNow,
    nextInvoiceId: () => `invoice-${++sequence}` as never,
    nextLineId: () => `line-${sequence}` as never,
  })
  return { gateway, repository }
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
    const { repository } = createRepository()

    const created = await repository.create(fractionalInput)
    const reloaded = await repository.findById(created.invoice.id)

    expect(created.invoice.totalMinor).toBe(126)
    expect(created.lines[0]?.lineTotalMinor).toBe(126)
    expect(reloaded).toEqual(created)
  })

  it('recomputes and round-trips half-up line totals when editing', async () => {
    const { repository } = createRepository()
    const created = await repository.create({ ...fractionalInput, lines: [{ ...fractionalInput.lines[0], quantity: 1 as never }] })

    const updated = await repository.update(created.invoice.id, fractionalInput)
    const reloaded = await repository.findById(created.invoice.id)

    expect(updated.invoice.totalMinor).toBe(126)
    expect(updated.lines[0]?.lineTotalMinor).toBe(126)
    expect(reloaded).toEqual(updated)
  })

  it('rejects missing invoices, active-payment mutations, and unknown catalog references', async () => {
    const { gateway, repository } = createRepository()
    const missingId = 'missing' as never

    await expect(repository.update(missingId, fractionalInput)).rejects.toThrow('invoice not found')
    await expect(repository.softDelete(missingId)).rejects.toThrow('invoice not found')
    await expect(repository.restore(missingId)).rejects.toThrow('invoice not found')
    await expect(repository.create({ ...fractionalInput, supplierId: 'unknown' as never })).rejects.toThrow('supplier not found')
    await expect(repository.create({ ...fractionalInput, lines: [] })).rejects.toThrow('invoice requires at least one line')
    await expect(repository.create({ ...fractionalInput, lines: [{ ...fractionalInput.lines[0], categoryId: 'unknown' as never }] })).rejects.toThrow('category not found')

    const created = await repository.create(fractionalInput)
    const state = gateway.read()
    state.payments.push({ id: 'payment-1' as never, invoiceId: created.invoice.id, amountMinor: 1 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null, isVoid: false, voidedAt: null, voidReason: null, createdAt: fixedNow() } as never)
    state.invoices[0] = { ...state.invoices[0], status: 'partially_paid', updatedAt: fixedNow() }
    await gateway.write(state)

    await expect(repository.update(created.invoice.id, fractionalInput)).rejects.toThrow('Void all payments before editing')
    await expect(repository.softDelete(created.invoice.id)).rejects.toThrow('Cannot delete: void all payments first')
  })
})
