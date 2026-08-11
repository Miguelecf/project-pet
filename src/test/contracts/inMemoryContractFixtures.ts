import type { CategoryRepository } from '../../modules/categories/CategoryRepository'
import type { DailyIncomeRepository } from '../../modules/daily-income/DailyIncomeRepository'
import type { InvoiceRepository } from '../../modules/invoices/InvoiceRepository'
import type { PaymentRepository } from '../../modules/invoices/PaymentRepository'
import type { SettingsRepository } from '../../modules/settings/SettingsRepository'
import type { SupplierRepository } from '../../modules/suppliers/SupplierRepository'
import type { ActivePayment, Category, DailyIncome, Invoice, InvoiceId, InvoiceLine, Settings, Supplier, VoidedPayment } from '../../types/domain'
import type { CategoryContractFixture } from './categoryRepositoryContract'
import type { InvoiceContractFixture } from './invoiceRepositoryContract'
import type { PaymentContractFixture } from './paymentRepositoryContract'
import type { SettingsContractFixture } from './settingsRepositoryContract'

const now = '2026-08-10T00:00:00.000Z' as never
const defaults = (): Settings => ({ currency: 'USD', dueAlertDays: 7 as never, createdAt: now, updatedAt: now })

export function createInMemoryContractFixtures(): {
  suppliers: SupplierRepository
  categories: CategoryContractFixture
  settings: SettingsContractFixture
  invoices: InvoiceContractFixture
  payments: PaymentContractFixture
  dailyIncome: DailyIncomeRepository
} {
  let sequence = 0
  let failNextInvoiceUpdate = false
  let currentSettings = defaults()
  const next = (kind: string) => `${kind}-${++sequence}` as never
  const suppliers = new Map<string, Supplier>()
  const categories = new Map<string, Category>()
  const referencedCategories = new Set<string>()
  const invoices = new Map<string, Invoice>()
  const lines = new Map<string, readonly InvoiceLine[]>()
  const payments = new Map<string, ActivePayment | VoidedPayment>()
  const incomes = new Map<string, DailyIncome>()

  const supplierRepository: SupplierRepository = {
    async findAll() { return [...suppliers.values()].filter(({ deletedAt }) => deletedAt === null) },
    async findById(id) { return suppliers.get(id) ?? null },
    async create(input) {
      const name = input.name.trim(); const normalizedName = name.toLowerCase()
      if ([...suppliers.values()].some((item) => item.deletedAt === null && item.normalizedName === normalizedName)) throw new Error('duplicate supplier')
      const supplier = { id: next('supplier'), name, normalizedName, defaultDueDays: input.defaultDueDays, deletedAt: null, createdAt: now, updatedAt: now } as Supplier
      suppliers.set(supplier.id, supplier); return supplier
    },
    async update(id, input) {
      const previous = suppliers.get(id); if (!previous) throw new Error('supplier not found')
      const name = input.name?.trim() ?? previous.name; const normalizedName = name.toLowerCase()
      if ([...suppliers.values()].some((item) => item.id !== id && item.deletedAt === null && item.normalizedName === normalizedName)) throw new Error('duplicate supplier')
      const updated = { ...previous, name, normalizedName, defaultDueDays: input.defaultDueDays ?? previous.defaultDueDays, updatedAt: now }
      suppliers.set(id, updated); return updated
    },
    async softDelete(id) { const item = suppliers.get(id); if (!item) throw new Error('supplier not found'); suppliers.set(id, { ...item, deletedAt: now, updatedAt: now }) },
  }

  const categoryRepository: CategoryRepository = {
    async findAll() { return [...categories.values()] },
    async findById(id) { return categories.get(id) ?? null },
    async create({ name }) {
      const trimmed = name.trim(); const normalizedName = trimmed.toLowerCase()
      if ([...categories.values()].some((item) => item.normalizedName === normalizedName)) throw new Error('duplicate category')
      const category = { id: next('category'), name: trimmed, normalizedName, createdAt: now, updatedAt: now } as Category
      categories.set(category.id, category); return category
    },
    async update(id, { name }) { const item = categories.get(id); if (!item) throw new Error('category not found'); const trimmed = name.trim(); const normalizedName = trimmed.toLowerCase(); if ([...categories.values()].some((other) => other.id !== id && other.normalizedName === normalizedName)) throw new Error('duplicate category'); const updated = { ...item, name: trimmed, normalizedName, updatedAt: now }; categories.set(id, updated); return updated },
    async delete(id) { if (referencedCategories.has(id)) throw new Error('category is referenced'); if (!categories.delete(id)) throw new Error('category not found') },
    async isReferenced(id) { return referencedCategories.has(id) ? 1 : 0 },
  }

  const settingsRepository: SettingsRepository = {
    async get() { return currentSettings },
    async save(input) { if ([...invoices.values(), ...incomes.values()].some((record) => record.currency !== input.currency)) throw new Error('currency is locked'); currentSettings = { ...currentSettings, ...input, updatedAt: now }; return currentSettings },
  }

  const invoiceRepository: InvoiceRepository = {
    async findAll() { return [...invoices.values()].filter(({ deletedAt }) => deletedAt === null) },
    async findById(id) { const invoice = invoices.get(id); return invoice ? { invoice, lines: lines.get(id) ?? [] } : null },
    async findByStatus(status) { return [...invoices.values()].filter((item) => item.deletedAt === null && item.status === status) },
    async findDeleted() { return [...invoices.values()].filter(({ deletedAt }) => deletedAt !== null) },
    async create(input) { return saveInvoice(next('invoice'), input) },
    async update(id, input) { if (failNextInvoiceUpdate) { failNextInvoiceUpdate = false; throw new Error('adapter write failed') }; if (!invoices.has(id)) throw new Error('invoice not found'); return saveInvoice(id, input) },
    async softDelete(id) { const invoice = invoices.get(id); if (!invoice) throw new Error('invoice not found'); invoices.set(id, { ...invoice, deletedAt: now, updatedAt: now }) },
    async restore(id) { const invoice = invoices.get(id); if (!invoice) throw new Error('invoice not found'); const restored = { ...invoice, deletedAt: null, updatedAt: now }; invoices.set(id, restored); return restored },
  }

  function saveInvoice(id: InvoiceId, input: Parameters<InvoiceRepository['create']>[0]) {
    const totalMinor = input.lines.reduce((sum, line) => sum + (line.quantity as number) * (line.unitCostMinor as number), 0) as never
    const existing = invoices.get(id)
    const invoice = { id, ...input, totalMinor, status: existing?.status ?? 'pending', deletedAt: existing?.deletedAt ?? null, createdAt: existing?.createdAt ?? now, updatedAt: now } as Invoice
    const invoiceLines = input.lines.map((line, index) => ({ ...line, id: next('line'), invoiceId: id, lineTotalMinor: ((line.quantity as number) * (line.unitCostMinor as number)) as never, position: (index + 1) as never, createdAt: now, updatedAt: now } as InvoiceLine))
    invoices.set(id, invoice); lines.set(id, invoiceLines); return { invoice, lines: invoiceLines }
  }

  const paymentRepository: PaymentRepository = {
    async findByInvoice(invoiceId) { return [...payments.values()].filter((payment) => payment.invoiceId === invoiceId) },
    async register(input) {
      const invoice = invoices.get(input.invoiceId); if (!invoice) throw new Error('invoice not found')
      const paid = [...payments.values()].filter((payment) => payment.invoiceId === input.invoiceId && !payment.isVoid).reduce((sum, payment) => sum + (payment.amountMinor as number), 0)
      if (paid + (input.amountMinor as number) > (invoice.totalMinor as number)) throw new Error('overpayment')
      const payment = { id: next('payment'), ...input, isVoid: false, voidedAt: null, voidReason: null, createdAt: now } as ActivePayment
      payments.set(payment.id, payment); return payment
    },
    async void(id, reason) { const payment = payments.get(id); if (!payment || payment.isVoid) throw new Error('payment not found'); const voided = { ...payment, isVoid: true, voidedAt: now, voidReason: reason as never } as VoidedPayment; payments.set(id, voided); return voided },
  }

  const dailyIncomeRepository: DailyIncomeRepository = {
    async findAll() { return [...incomes.values()] },
    async findById(id) { return incomes.get(id) ?? null },
    async create(input) { if ([...incomes.values()].some((item) => item.saleDate === input.saleDate)) throw new Error('duplicate sale date'); const income = { id: next('income'), ...input, currency: currentSettings.currency, createdAt: now, updatedAt: now } as DailyIncome; incomes.set(income.id, income); return income },
    async update(id, input) { const previous = incomes.get(id); if (!previous) throw new Error('income not found'); if ([...incomes.values()].some((item) => item.id !== id && item.saleDate === input.saleDate)) throw new Error('duplicate sale date'); const updated = { ...previous, ...input, updatedAt: now }; incomes.set(id, updated); return updated },
    async delete(id) { if (!incomes.delete(id)) throw new Error('income not found') },
  }

  return {
    suppliers: supplierRepository,
    categories: { repository: categoryRepository, async createReference(id) { referencedCategories.add(id) } },
    settings: {
      repository: settingsRepository,
      async recordInvoice() { invoices.set(next('settings-invoice'), { id: next('invoice'), supplierId: 'supplier-1' as never, docRef: null, issueDate: '2026-08-10' as never, dueDate: null, currency: currentSettings.currency, totalMinor: 1 as never, status: 'pending', notes: null, deletedAt: null, createdAt: now, updatedAt: now } as Invoice) },
      async recordDailyIncome() { incomes.set(next('settings-income'), { id: next('income'), saleDate: '2026-08-10' as never, amountMinor: 1 as never, currency: currentSettings.currency, note: null, createdAt: now, updatedAt: now } as DailyIncome) },
    },
    invoices: { repository: invoiceRepository, failNextUpdate() { failNextInvoiceUpdate = true } },
    payments: {
      repository: paymentRepository,
      async createInvoice(totalMinor) { return (await invoiceRepository.create({ supplierId: 'supplier-1' as never, docRef: null, issueDate: '2026-08-10' as never, dueDate: null, currency: 'USD', notes: null, lines: [{ categoryId: 'category-1' as never, productRef: 'payment fixture', externalSku: null, description: 'Payment fixture', quantity: 1 as never, unitCostMinor: totalMinor }] })).invoice.id },
      async getBalance(invoiceId) { const invoice = invoices.get(invoiceId); if (!invoice) throw new Error('invoice not found'); const paid = [...payments.values()].filter((payment) => payment.invoiceId === invoiceId && !payment.isVoid).reduce((sum, payment) => sum + (payment.amountMinor as number), 0); const remainingMinor = ((invoice.totalMinor as number) - paid) as never; return { remainingMinor, status: paid === 0 ? 'pending' : paid === (invoice.totalMinor as number) ? 'paid' : 'partially_paid' } },
    },
    dailyIncome: dailyIncomeRepository,
  }
}
