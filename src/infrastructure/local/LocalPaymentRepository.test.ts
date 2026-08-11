import { describePaymentRepositoryContract } from '../../test/contracts/paymentRepositoryContract'
import { LocalInvoiceRepository } from './LocalInvoiceRepository'
import { LocalPaymentRepository } from './LocalPaymentRepository'
import { LocalStateGateway } from './LocalStateGateway'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

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
