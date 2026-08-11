import type { Category, DailyIncome, Invoice, InvoiceLine, Payment, Settings, Supplier } from '../../types/domain'

export const SCHEMA_VERSION = 1
export const STORAGE_KEY = `project-pet-v${SCHEMA_VERSION}`

export interface LocalState {
  readonly schemaVersion: typeof SCHEMA_VERSION
  settings: Settings | null
  suppliers: Supplier[]
  categories: Category[]
  invoices: Invoice[]
  invoiceLines: InvoiceLine[]
  payments: Payment[]
  dailyIncomes: DailyIncome[]
}

export function createEmptyLocalState(): LocalState {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: null,
    suppliers: [],
    categories: [],
    invoices: [],
    invoiceLines: [],
    payments: [],
    dailyIncomes: [],
  }
}
