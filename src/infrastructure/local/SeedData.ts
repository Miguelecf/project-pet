import type { LocalState } from './LocalStateSchema'

export const SEED_DATA_VERSION = 1

const timestamp = '2026-08-10T00:00:00.000Z' as never

export const SEED_DATA: LocalState & { seedDataVersion: typeof SEED_DATA_VERSION } = {
  seedDataVersion: SEED_DATA_VERSION,
  schemaVersion: 1,
  settings: { currency: 'USD', dueAlertDays: 7 as never, createdAt: timestamp, updatedAt: timestamp },
  suppliers: [
    { id: 'demo-supplier-a' as never, name: 'Demo Supplier A', normalizedName: 'demo supplier a', defaultDueDays: 30 as never, deletedAt: null, createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-supplier-b' as never, name: 'Demo Supplier B', normalizedName: 'demo supplier b', defaultDueDays: null, deletedAt: null, createdAt: timestamp, updatedAt: timestamp },
  ],
  categories: ['Demo Category A', 'Demo Category B', 'Demo Category C', 'Demo Category D', 'Demo Category E', 'Demo Category F'].map((name, index) => ({ id: `demo-category-${index + 1}` as never, name, normalizedName: name.toLowerCase(), createdAt: timestamp, updatedAt: timestamp })),
  invoices: [
    { id: 'demo-invoice-pending' as never, supplierId: 'demo-supplier-a' as never, docRef: 'DEMO-100', issueDate: '2026-08-01' as never, dueDate: '2026-08-05' as never, currency: 'USD', totalMinor: 10000 as never, status: 'pending', notes: 'Demo pending invoice', deletedAt: null, createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-invoice-partial' as never, supplierId: 'demo-supplier-a' as never, docRef: 'DEMO-200', issueDate: '2026-08-02' as never, dueDate: '2026-08-20' as never, currency: 'USD', totalMinor: 10000 as never, status: 'partially_paid', notes: 'Demo partial invoice', deletedAt: null, createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-invoice-paid' as never, supplierId: 'demo-supplier-b' as never, docRef: 'DEMO-300', issueDate: '2026-08-03' as never, dueDate: '2026-08-25' as never, currency: 'USD', totalMinor: 10000 as never, status: 'paid', notes: 'Demo paid invoice', deletedAt: null, createdAt: timestamp, updatedAt: timestamp },
  ],
  invoiceLines: [
    { id: 'demo-line-pending' as never, invoiceId: 'demo-invoice-pending' as never, categoryId: 'demo-category-1' as never, productRef: 'DEMO-PENDING', externalSku: null, description: 'Demo pending line', quantity: 1 as never, unitCostMinor: 10000 as never, lineTotalMinor: 10000 as never, position: 1 as never, createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-line-partial' as never, invoiceId: 'demo-invoice-partial' as never, categoryId: 'demo-category-2' as never, productRef: 'DEMO-PARTIAL', externalSku: null, description: 'Demo partial line', quantity: 1 as never, unitCostMinor: 10000 as never, lineTotalMinor: 10000 as never, position: 1 as never, createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-line-paid' as never, invoiceId: 'demo-invoice-paid' as never, categoryId: 'demo-category-3' as never, productRef: 'DEMO-PAID', externalSku: null, description: 'Demo paid line', quantity: 1 as never, unitCostMinor: 10000 as never, lineTotalMinor: 10000 as never, position: 1 as never, createdAt: timestamp, updatedAt: timestamp },
  ],
  payments: [
    { id: 'demo-payment-partial' as never, invoiceId: 'demo-invoice-partial' as never, amountMinor: 5000 as never, paymentDate: '2026-08-04' as never, method: 'cash', reference: null, notes: 'Demo partial payment', createdAt: timestamp, isVoid: false, voidedAt: null, voidReason: null },
    { id: 'demo-payment-paid' as never, invoiceId: 'demo-invoice-paid' as never, amountMinor: 10000 as never, paymentDate: '2026-08-05' as never, method: 'bank_transfer', reference: 'DEMO-TRANSFER', notes: 'Demo paid payment', createdAt: timestamp, isVoid: false, voidedAt: null, voidReason: null },
  ],
  dailyIncomes: [
    { id: 'demo-income-1' as never, saleDate: '2026-08-08' as never, amountMinor: 25000 as never, currency: 'USD', note: 'Demo daily income A', createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-income-2' as never, saleDate: '2026-08-09' as never, amountMinor: 30000 as never, currency: 'USD', note: 'Demo daily income B', createdAt: timestamp, updatedAt: timestamp },
  ],
}
