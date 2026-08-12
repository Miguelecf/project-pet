import { describePaymentRepositoryContract } from '../../test/contracts/paymentRepositoryContract'
import { describe, expect, it } from 'vitest'
import { LocalInvoiceRepository } from './LocalInvoiceRepository'
import { LocalPaymentRepository } from './LocalPaymentRepository'
import { LocalStateGateway } from './LocalStateGateway'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

function createRepositories() {
  const gateway = new LocalStateGateway(new MemoryStorage())
  void gateway.write({
    schemaVersion: 1,
    settings: { currency: 'USD', dueAlertDays: 7 as never, createdAt: fixedNow(), updatedAt: fixedNow() },
    suppliers: [{ id: 'supplier-1' as never, name: 'Demo Supplier', normalizedName: 'demo supplier', defaultDueDays: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() }],
    categories: [{ id: 'category-1' as never, name: 'Demo Category', normalizedName: 'demo category', createdAt: fixedNow(), updatedAt: fixedNow() }],
    invoices: [], invoiceLines: [], payments: [], dailyIncomes: [],
  })
  let invoiceSequence = 0
  let paymentSequence = 0
  const invoices = new LocalInvoiceRepository(gateway, { now: fixedNow, nextInvoiceId: () => `invoice-${++invoiceSequence}` as never, nextLineId: () => `line-${invoiceSequence}` as never })
  const payments = new LocalPaymentRepository(gateway, { now: fixedNow, nextId: () => `payment-${++paymentSequence}` as never })
  return { invoices, payments }
}

describePaymentRepositoryContract(() => {
  const gateway = new LocalStateGateway(new MemoryStorage())
  void gateway.write({
    schemaVersion: 1,
    settings: { currency: 'USD', dueAlertDays: 7 as never, createdAt: fixedNow(), updatedAt: fixedNow() },
    suppliers: [{ id: 'supplier-1' as never, name: 'Demo Supplier', normalizedName: 'demo supplier', defaultDueDays: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() }],
    categories: [{ id: 'category-1' as never, name: 'Demo Category', normalizedName: 'demo category', createdAt: fixedNow(), updatedAt: fixedNow() }],
    invoices: [], invoiceLines: [], payments: [], dailyIncomes: [],
  })
  let invoiceSequence = 0
  let paymentSequence = 0
  const invoiceRepository = new LocalInvoiceRepository(gateway, {
    now: fixedNow,
    nextInvoiceId: () => `invoice-${++invoiceSequence}` as never,
    nextLineId: () => `line-${invoiceSequence}` as never,
  })
  const repository = new LocalPaymentRepository(gateway, { now: fixedNow, nextId: () => `payment-${++paymentSequence}` as never })

  return {
    repository,
    invoiceRepository,
    async createInvoice(totalMinor) {
      return (await invoiceRepository.create({
        supplierId: 'supplier-1' as never, docRef: null, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', notes: null,
        lines: [{ categoryId: 'category-1' as never, productRef: 'fixture', externalSku: null, description: 'Fixture', quantity: 1 as never, unitCostMinor: totalMinor }],
      })).invoice.id
    },
  }
})

describe('LocalPaymentRepository error handling', () => {
  it('rejects unknown invoices, unknown or already voided payments, and blank void reasons', async () => {
    const { invoices, payments } = createRepositories()
    const input = { invoiceId: 'missing' as never, amountMinor: 1 as never, paymentDate: '2026-08-10' as never, method: 'cash' as const, reference: null, notes: null }

    await expect(payments.getBalance(input.invoiceId)).rejects.toThrow('invoice not found')
    await expect(payments.register(input)).rejects.toThrow('invoice not found')
    await expect(payments.void('missing' as never, 'reason')).rejects.toThrow('payment not found')

    const invoice = await invoices.create({ supplierId: 'supplier-1' as never, docRef: null, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', notes: null, lines: [{ categoryId: 'category-1' as never, productRef: 'fixture', externalSku: null, description: 'Fixture', quantity: 1 as never, unitCostMinor: 100 as never }] })
    const payment = await payments.register({ ...input, invoiceId: invoice.invoice.id, amountMinor: 100 as never })

    await expect(payments.void(payment.id, '   ')).rejects.toThrow('void reason is required')
    await payments.void(payment.id, 'duplicate')
    await expect(payments.void(payment.id, 'duplicate')).rejects.toThrow('payment not found')
  })

  it('uses generated defaults when no clock or ID generator is injected', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.write({
      schemaVersion: 1,
      settings: { currency: 'USD', dueAlertDays: 7 as never, createdAt: fixedNow(), updatedAt: fixedNow() },
      suppliers: [{ id: 'supplier-1' as never, name: 'Demo Supplier', normalizedName: 'demo supplier', defaultDueDays: null, deletedAt: null, createdAt: fixedNow(), updatedAt: fixedNow() }],
      categories: [{ id: 'category-1' as never, name: 'Demo Category', normalizedName: 'demo category', createdAt: fixedNow(), updatedAt: fixedNow() }],
      invoices: [], invoiceLines: [], payments: [], dailyIncomes: [],
    })
    const invoices = new LocalInvoiceRepository(gateway, { now: fixedNow, nextInvoiceId: () => 'invoice-1' as never, nextLineId: () => 'line-1' as never })
    const payments = new LocalPaymentRepository(gateway)
    const invoice = await invoices.create({ supplierId: 'supplier-1' as never, docRef: null, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', notes: null, lines: [{ categoryId: 'category-1' as never, productRef: 'fixture', externalSku: null, description: 'Fixture', quantity: 1 as never, unitCostMinor: 100 as never }] })

    const payment = await payments.register({ invoiceId: invoice.invoice.id, amountMinor: 100 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })

    expect(payment.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(payment.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
