import { describe, expect, it } from 'vitest'
import { aggregateDashboard, dateRangeFor } from './dashboardAggregates'

const invoice = (overrides: Record<string, unknown> = {}) => ({
  id: 'invoice-a', issueDate: '2026-08-12', createdAt: '2026-08-12T10:00:00.000Z', totalMinor: 100,
  deletedAt: null, docRef: 'A', ...overrides,
})
const payment = (overrides: Record<string, unknown> = {}) => ({
  id: 'payment-a', invoiceId: 'invoice-a', amountMinor: 40, paymentDate: '2026-08-12', isVoid: false, ...overrides,
})
const income = (saleDate: string, amountMinor: number) => ({ id: saleDate, saleDate, amountMinor })

describe('dashboard aggregates', () => {
  it('uses inclusive local day, Monday-Sunday week, and calendar-month ranges', () => {
    expect(dateRangeFor('day', '2026-08-12' as never)).toEqual({ start: '2026-08-12', end: '2026-08-12' })
    expect(dateRangeFor('week', '2026-08-12' as never)).toEqual({ start: '2026-08-10', end: '2026-08-16' })
    expect(dateRangeFor('month', '2026-08-12' as never)).toEqual({ start: '2026-08-01', end: '2026-08-31' })
  })

  it('calculates calendar boundaries across a year without parsing an ISO record as a browser date', () => {
    expect(dateRangeFor('week', '2026-01-01' as never)).toEqual({ start: '2025-12-29', end: '2026-01-04' })
    expect(dateRangeFor('month', '2024-02-12' as never)).toEqual({ start: '2024-02-01', end: '2024-02-29' })
  })

  it('reconciles selected-period income and active paid expenses while keeping all-time debt and statuses', () => {
    const result = aggregateDashboard({ today: '2026-08-12' as never, period: 'day',
      invoices: [invoice(), invoice({ id: 'unpaid', totalMinor: 70 })] as never,
      payments: [payment()] as never, incomes: [income('2026-08-12', 300), income('2026-08-11', 99)] as never,
      lines: [], categories: [] as never })
    expect(result.metrics).toEqual({ incomeMinor: 300, paidExpensesMinor: 40, estimatedCashResultMinor: 260, outstandingMinor: 130 })
    expect(result.statusCounts).toEqual({ pending: 1, partially_paid: 1, paid: 0 })
  })

  it('excludes deleted invoices and voided payments, produces zero week days, and detects seven-date inactivity', () => {
    const result = aggregateDashboard({ today: '2026-08-12' as never, period: 'week',
      invoices: [invoice({ deletedAt: '2026-08-01T00:00:00.000Z' })] as never,
      payments: [payment(), payment({ id: 'void', isVoid: true, amountMinor: 99 })] as never,
      incomes: [income('2026-08-03', 50), income('2026-08-10', 20)] as never, lines: [], categories: [] as never })
    expect(result.metrics).toEqual({ incomeMinor: 20, paidExpensesMinor: 0, estimatedCashResultMinor: 20, outstandingMinor: 0 })
    expect(result.weeklyIncome.map((day) => day.amountMinor)).toEqual([20, 0, 0, 0, 0, 0, 0])
    expect(result.inactive).toBe(false)
  })

  it('allocates payment remainders by line order, sorts categories, and orders latest active invoices deterministically', () => {
    const result = aggregateDashboard({ today: '2026-08-12' as never, period: 'month',
      invoices: [invoice(), invoice({ id: 'b', docRef: 'B', createdAt: '2026-08-12T11:00:00.000Z' }), invoice({ id: 'a', docRef: 'A2', createdAt: '2026-08-12T11:00:00.000Z' })] as never,
      payments: [payment({ amountMinor: 100 })] as never,
      incomes: [] as never,
      lines: [
        { id: 'line-2', invoiceId: 'invoice-a', categoryId: 'cat-b', lineTotalMinor: 1, position: 2 },
        { id: 'line-1', invoiceId: 'invoice-a', categoryId: 'cat-a', lineTotalMinor: 1, position: 1 },
        { id: 'line-3', invoiceId: 'invoice-a', categoryId: 'cat-c', lineTotalMinor: 1, position: 3 },
      ] as never,
      categories: [{ id: 'cat-a', name: 'Alpha' }, { id: 'cat-b', name: 'Beta' }, { id: 'cat-c', name: 'Gamma' }] as never })
    expect(result.categoryBreakdown).toEqual([{ categoryId: 'cat-a', name: 'Alpha', amountMinor: 34 }, { categoryId: 'cat-b', name: 'Beta', amountMinor: 33 }, { categoryId: 'cat-c', name: 'Gamma', amountMinor: 33 }])
    expect(result.latestInvoices.map((item) => item.invoice.id)).toEqual(['a', 'b', 'invoice-a'])
    expect(result.inactive).toBe(true)
  })

  it('suppresses inactivity at either inclusive seven-day boundary and omits categories when no qualifying allocation exists', () => {
    const atStart = aggregateDashboard({ today: '2026-08-12' as never, period: 'month', invoices: [], payments: [], incomes: [income('2026-08-06', 1)] as never,
      lines: [], categories: [] as never })
    const atEnd = aggregateDashboard({ today: '2026-08-12' as never, period: 'month', invoices: [], payments: [], incomes: [income('2026-08-12', 1)] as never, lines: [], categories: [] as never })
    expect(atStart.inactive).toBe(false)
    expect(atStart.categoryBreakdown).toEqual([])
    expect(atEnd.inactive).toBe(false)
  })

  it('rejects unsafe metric sums instead of returning an imprecise result', () => {
    expect(() => aggregateDashboard({ today: '2026-08-12' as never, period: 'day', invoices: [], payments: [],
      incomes: [income('2026-08-12', Number.MAX_SAFE_INTEGER), income('2026-08-12', 1)] as never, lines: [], categories: [] as never })).toThrow('safe integer')
  })

  it('uses exact integer arithmetic for large valid allocation inputs and reconciles every share to the payment', () => {
    const result = aggregateDashboard({ today: '2026-08-12' as never, period: 'month',
      invoices: [invoice({ totalMinor: 9007199254739991 })] as never,
      payments: [payment({ amountMinor: 9007199254739991 })] as never, incomes: [],
      lines: [
        { id: 'one', invoiceId: 'invoice-a', categoryId: 'one', lineTotalMinor: 3002399751580330, position: 1 },
        { id: 'two', invoiceId: 'invoice-a', categoryId: 'two', lineTotalMinor: 3002399751580330, position: 2 },
        { id: 'three', invoiceId: 'invoice-a', categoryId: 'three', lineTotalMinor: 3002399751580331, position: 3 },
      ] as never, categories: [{ id: 'one', name: 'One' }, { id: 'two', name: 'Two' }, { id: 'three', name: 'Three' }] as never })
    expect(result.categoryBreakdown).toEqual([
      { categoryId: 'one', name: 'One', amountMinor: 3002399751579997 },
      { categoryId: 'three', name: 'Three', amountMinor: 3002399751579997 },
      { categoryId: 'two', name: 'Two', amountMinor: 3002399751579997 },
    ])
    expect(result.categoryBreakdown.reduce((sum, category) => sum + category.amountMinor, 0)).toBe(9007199254739991)
  })

  it('omits zero-total allocations, sorts equal category amounts by name then id, and gives tied-position remainder to line id order', () => {
    const result = aggregateDashboard({ today: '2026-08-12' as never, period: 'month',
      invoices: [invoice({ id: 'allocated', totalMinor: 3 }), invoice({ id: 'zero', totalMinor: 0 })] as never,
      payments: [payment({ invoiceId: 'allocated', amountMinor: 2 }), payment({ id: 'zero-payment', invoiceId: 'zero', amountMinor: 5 })] as never,
      incomes: [], lines: [
        { id: 'z-line', invoiceId: 'allocated', categoryId: 'z', lineTotalMinor: 1, position: 1 },
        { id: 'a-line', invoiceId: 'allocated', categoryId: 'a', lineTotalMinor: 1, position: 1 },
        { id: 'b-line', invoiceId: 'allocated', categoryId: 'b', lineTotalMinor: 1, position: 2 },
      ] as never,
      categories: [{ id: 'z', name: 'Same' }, { id: 'a', name: 'Same' }, { id: 'b', name: 'Bravo' }] as never })
    expect(result.categoryBreakdown).toEqual([
      { categoryId: 'a', name: 'Same', amountMinor: 1 },
      { categoryId: 'z', name: 'Same', amountMinor: 1 },
    ])
    const tieSorted = aggregateDashboard({ today: '2026-08-12' as never, period: 'month', invoices: [invoice({ totalMinor: 3 })] as never,
      payments: [payment({ amountMinor: 3 })] as never, incomes: [], lines: [
        { id: 'line-z', invoiceId: 'invoice-a', categoryId: 'z', lineTotalMinor: 1, position: 1 },
        { id: 'line-a', invoiceId: 'invoice-a', categoryId: 'a', lineTotalMinor: 1, position: 2 },
        { id: 'line-b', invoiceId: 'invoice-a', categoryId: 'b', lineTotalMinor: 1, position: 3 },
      ] as never, categories: [{ id: 'z', name: 'Same' }, { id: 'a', name: 'Same' }, { id: 'b', name: 'Bravo' }] as never })
    expect(tieSorted.categoryBreakdown.map((category) => `${category.name}:${category.categoryId}`)).toEqual(['Bravo:b', 'Same:a', 'Same:z'])
  })

  it('shows exactly ten latest active invoices from twelve and keeps weekly summary stable across period filters', () => {
    const invoices = Array.from({ length: 12 }, (_, index) => invoice({ id: `invoice-${String(index + 1).padStart(2, '0')}`, issueDate: '2026-08-12', createdAt: `2026-08-12T${String(index).padStart(2, '0')}:00:00.000Z` }))
    invoices.push(invoice({ id: 'deleted-newest', issueDate: '2026-08-13', deletedAt: '2026-08-13T00:00:00.000Z' }))
    const shared = { today: '2026-08-12' as never, invoices: invoices as never, payments: [], incomes: [income('2026-08-10', 10), income('2026-08-12', 20)] as never, lines: [], categories: [] as never }
    const day = aggregateDashboard({ ...shared, period: 'day' })
    const month = aggregateDashboard({ ...shared, period: 'month' })
    expect(day.latestInvoices).toHaveLength(10)
    expect(day.latestInvoices.map((item) => item.invoice.id)).toEqual(['invoice-12', 'invoice-11', 'invoice-10', 'invoice-09', 'invoice-08', 'invoice-07', 'invoice-06', 'invoice-05', 'invoice-04', 'invoice-03'])
    expect(day.weeklyIncome).toEqual(month.weeklyIncome)
  })
})
