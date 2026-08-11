import { createEmptyLocalState, SCHEMA_VERSION, STORAGE_KEY, type LocalState } from './LocalStateSchema'
import { SEED_DATA } from './SeedData'

export type LocalStateRecovery = 'ready' | 'needs_seed' | 'unavailable'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const collectionKeys = ['suppliers', 'categories', 'invoices', 'invoiceLines', 'payments', 'dailyIncomes'] as const
type StateCollections = { settings: unknown; suppliers: unknown[]; categories: unknown[]; invoices: unknown[]; invoiceLines: unknown[]; payments: unknown[]; dailyIncomes: unknown[] }

export class LocalStateGateway {
  recovery: LocalStateRecovery = 'needs_seed'
  private readonly storage: StorageLike

  constructor(storage: StorageLike) {
    this.storage = storage
  }

  read(): LocalState {
    let raw: string | null
    try {
      raw = this.storage.getItem(STORAGE_KEY)
    } catch {
      this.recovery = 'unavailable'
      return createEmptyLocalState()
    }

    if (!raw) return this.recoverNeedsSeed()

    try {
      const parsed: unknown = JSON.parse(raw)
      if (!isLocalState(parsed)) return this.recoverNeedsSeed()

      this.recovery = 'ready'
      return cloneState(parsed)
    } catch {
      return this.recoverNeedsSeed()
    }
  }

  async write(candidate: LocalState): Promise<void> {
    const nextState = cloneAndValidate(candidate)
    const serialized = JSON.stringify(nextState)

    this.storage.setItem(STORAGE_KEY, serialized)
    this.recovery = 'ready'
  }

  async loadSeed(): Promise<void> { await this.write(cloneState(SEED_DATA)) }
  async restore(): Promise<void> { await this.loadSeed() }

  private recoverNeedsSeed(): LocalState {
    this.recovery = 'needs_seed'
    return createEmptyLocalState()
  }
}

function cloneAndValidate(candidate: LocalState): LocalState {
  if (!isLocalState(candidate)) throw new Error('invalid local state envelope')
  return cloneState(candidate)
}

function cloneState(state: LocalState): LocalState {
  return JSON.parse(JSON.stringify(state)) as LocalState
}

function isLocalState(value: unknown): value is LocalState {
  if (!isRecord(value) || value.schemaVersion !== SCHEMA_VERSION || !hasCollections(value)) return false
  const { settings, suppliers, categories, invoices, invoiceLines, payments, dailyIncomes } = value
  if (!(settings === null || (isRecord(settings) && isSettings(settings))) || !suppliers.every(isSupplier) || !categories.every(isCategory)) return false
  if (!invoices.every(isInvoice) || !invoiceLines.every(isInvoiceLine) || !payments.every(isPayment) || !dailyIncomes.every(isDailyIncome)) return false
  const validSuppliers = suppliers as Record<string, unknown>[]
  const validCategories = categories as Record<string, unknown>[]
  const validInvoices = invoices as Record<string, unknown>[]
  const validLines = invoiceLines as Record<string, unknown>[]
  const validPayments = payments as Record<string, unknown>[]
  const validDailyIncomes = dailyIncomes as Record<string, unknown>[]

  const supplierIds = idsOf(validSuppliers)
  const categoryIds = idsOf(validCategories)
  const invoiceIds = idsOf(validInvoices)
  return supplierIds !== null && categoryIds !== null && invoiceIds !== null
    && idsOf(validLines) !== null && idsOf(validPayments) !== null && idsOf(validDailyIncomes) !== null
    && validInvoices.every((invoice) => supplierIds.has(invoice.supplierId as string) && validLines.some((line) => line.invoiceId === invoice.id))
    && validLines.every((line) => invoiceIds.has(line.invoiceId as string) && categoryIds.has(line.categoryId as string))
    && validPayments.every((payment) => invoiceIds.has(payment.invoiceId as string))
    && validInvoices.every((invoice) => hasConsistentPaymentBalance(invoice, validPayments.filter((payment) => payment.invoiceId === invoice.id)))
}

function hasConsistentPaymentBalance(invoice: Record<string, unknown>, payments: readonly Record<string, unknown>[]): boolean {
  const paid = payments.filter((payment) => payment.isVoid === false).reduce((total, payment) => total + (payment.amountMinor as number), 0)
  const totalMinor = invoice.totalMinor as number
  const remaining = totalMinor - paid
  const expectedStatus = paid === 0 ? 'pending' : remaining === 0 ? 'paid' : 'partially_paid'
  return remaining >= 0 && invoice.status === expectedStatus
}

function isSettings(value: Record<string, unknown>): boolean {
  return isCurrency(value.currency) && isNonNegativeInteger(value.dueAlertDays) && hasTimestamps(value)
}

function hasCollections(value: Record<string, unknown>): value is Record<string, unknown> & StateCollections {
  return collectionKeys.every((key) => Array.isArray(value[key])) && 'settings' in value
}

function isSupplier(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && hasId(value) && isText(value.name) && isText(value.normalizedName) && (value.defaultDueDays === null || isPositiveInteger(value.defaultDueDays)) && isNullableTimestamp(value.deletedAt) && hasTimestamps(value)
}

function isCategory(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && hasId(value) && isText(value.name) && isText(value.normalizedName) && hasTimestamps(value)
}

function isInvoice(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && hasId(value) && isText(value.supplierId) && isNullableText(value.docRef) && isPastOrTodayDate(value.issueDate) && isNullableDate(value.dueDate) && isCurrency(value.currency) && isNonNegativeInteger(value.totalMinor) && isOneOf(value.status, ['pending', 'partially_paid', 'paid']) && isNullableText(value.notes) && isNullableTimestamp(value.deletedAt) && hasTimestamps(value)
}

function isInvoiceLine(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && hasId(value) && isText(value.invoiceId) && isText(value.categoryId) && isText(value.productRef) && isNullableText(value.externalSku) && isText(value.description) && isQuantity(value.quantity) && isNonNegativeInteger(value.unitCostMinor) && isNonNegativeInteger(value.lineTotalMinor) && isPositiveInteger(value.position) && hasTimestamps(value)
}

function isPayment(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || !hasId(value) || !isText(value.invoiceId) || !isPositiveInteger(value.amountMinor) || !isPastOrTodayDate(value.paymentDate) || !isOneOf(value.method, ['bank_transfer', 'cash', 'debit_card', 'credit_card', 'digital_wallet']) || !isNullableText(value.reference) || !isNullableText(value.notes) || !isTimestamp(value.createdAt)) return false
  return value.isVoid === false ? value.voidedAt === null && value.voidReason === null : value.isVoid === true && isTimestamp(value.voidedAt) && isText(value.voidReason)
}

function isDailyIncome(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && hasId(value) && isPastOrTodayDate(value.saleDate) && isPositiveInteger(value.amountMinor) && isCurrency(value.currency) && isNullableText(value.note) && hasTimestamps(value)
}

function idsOf(values: Record<string, unknown>[]): Set<string> | null {
  const ids = values.map((value) => value.id)
  return ids.every(isText) && new Set(ids).size === ids.length ? new Set(ids) : null
}

function hasId(value: Record<string, unknown>): boolean { return isText(value.id) }
function hasTimestamps(value: Record<string, unknown>): boolean { return isTimestamp(value.createdAt) && isTimestamp(value.updatedAt) }
function isNullableTimestamp(value: unknown): boolean { return value === null || isTimestamp(value) }
function isNullableText(value: unknown): boolean { return value === null || typeof value === 'string' }
function isText(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 }
function isCurrency(value: unknown): boolean { return value === 'ARS' || value === 'USD' }
function isOneOf(value: unknown, allowed: readonly string[]): boolean { return typeof value === 'string' && allowed.includes(value) }
function isPositiveInteger(value: unknown): boolean { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 }
function isNonNegativeInteger(value: unknown): boolean { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 }
function isQuantity(value: unknown): boolean { return typeof value === 'number' && Number.isFinite(value) && value > 0 && Math.round(value * 1000) === value * 1000 }
function isTimestamp(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{3})?Z$/.exec(value)
  return match !== null && isCalendarDate(match[1], match[2], match[3]) && Number(match[4]) < 24 && Number(match[5]) < 60 && Number(match[6]) < 60
}
function isNullableDate(value: unknown): boolean { return value === null || isDate(value) }
function isPastOrTodayDate(value: unknown): boolean { return isDate(value) && value <= new Date().toISOString().slice(0, 10) }
function isDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match !== null && isCalendarDate(match[1], match[2], match[3])
}
function isCalendarDate(yearText: string, monthText: string, dayText: string): boolean {
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export { createEmptyLocalState, SCHEMA_VERSION, STORAGE_KEY }
export type { LocalState }
