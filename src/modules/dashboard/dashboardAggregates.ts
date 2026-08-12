import type { Category, DailyIncome, Invoice, InvoiceLine, ISODate, Payment } from '../../types/domain'
import { deriveStatus } from '../../utils/finance'

export type DashboardPeriod = 'day' | 'week' | 'month'
export interface DateRange { readonly start: ISODate; readonly end: ISODate }
interface Input { readonly today: ISODate; readonly period: DashboardPeriod; readonly invoices: readonly Invoice[]; readonly payments: readonly Payment[]; readonly incomes: readonly DailyIncome[]; readonly lines: readonly InvoiceLine[]; readonly categories: readonly Category[] }

const parseCalendarDate = (date: ISODate) => date.split('-').map(Number) as [number, number, number]
const asISODate = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` as ISODate
const daysInMonth = (year: number, month: number) => month === 2 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) ? 29 : [4, 6, 9, 11].includes(month) ? 30 : 31

function addDays(date: ISODate, amount: number): ISODate {
  let [year, month, day] = parseCalendarDate(date)
  while (amount > 0) {
    day++
    if (day > daysInMonth(year, month)) { day = 1; month++; if (month > 12) { month = 1; year++ } }
    amount--
  }
  while (amount < 0) {
    day--
    if (day === 0) { month--; if (month === 0) { month = 12; year-- }; day = daysInMonth(year, month) }
    amount++
  }
  return asISODate(year, month, day)
}

const dayOfWeek = (date: ISODate) => {
  let [year, month, day] = parseCalendarDate(date)
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
  if (month < 3) year--
  return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + offsets[month - 1] + day) % 7
}

const safe = (left: number, right: number) => {
  const total = left + right
  if (!Number.isSafeInteger(total)) throw new RangeError('Dashboard calculation exceeds safe integer range')
  return total
}
const subtract = (left: number, right: number) => {
  const total = left - right
  if (!Number.isSafeInteger(total)) throw new RangeError('Dashboard calculation exceeds safe integer range')
  return total
}
const fromBigInt = (value: bigint) => {
  const result = Number(value)
  if (!Number.isSafeInteger(result)) throw new RangeError('Dashboard calculation exceeds safe integer range')
  return result
}
const proportionalShare = (paymentMinor: number, lineTotalMinor: number, invoiceTotalMinor: number) => {
  if (!Number.isSafeInteger(paymentMinor) || !Number.isSafeInteger(lineTotalMinor) || !Number.isSafeInteger(invoiceTotalMinor) || invoiceTotalMinor <= 0) {
    throw new RangeError('Dashboard calculation requires safe integer allocation inputs')
  }
  return fromBigInt(BigInt(paymentMinor) * BigInt(lineTotalMinor) / BigInt(invoiceTotalMinor))
}
const inRange = (date: ISODate, range: DateRange) => date >= range.start && date <= range.end

export function dateRangeFor(period: DashboardPeriod, today: ISODate): DateRange {
  const [year, month] = parseCalendarDate(today)
  if (period === 'day') return { start: today, end: today }
  if (period === 'week') {
    const day = dayOfWeek(today)
    return { start: addDays(today, day === 0 ? -6 : 1 - day), end: addDays(today, day === 0 ? 0 : 7 - day) }
  }
  return { start: asISODate(year, month, 1), end: asISODate(year, month, daysInMonth(year, month)) }
}

export function aggregateDashboard(input: Input) {
  const range = dateRangeFor(input.period, input.today)
  const active = input.invoices.filter((invoice) => invoice.deletedAt === null)
  const activeIds = new Set(active.map((invoice) => invoice.id))
  const payments = input.payments.filter((payment) => !payment.isVoid && activeIds.has(payment.invoiceId))
  const paidByInvoice = new Map<string, number>()
  payments.forEach((payment) => paidByInvoice.set(payment.invoiceId, safe(paidByInvoice.get(payment.invoiceId) ?? 0, payment.amountMinor)))
  const incomeMinor = input.incomes.filter((income) => inRange(income.saleDate, range)).reduce((sum, income) => safe(sum, income.amountMinor), 0)
  const periodPayments = payments.filter((payment) => inRange(payment.paymentDate, range))
  const paidExpensesMinor = periodPayments.reduce((sum, payment) => safe(sum, payment.amountMinor), 0)
  const outstandingMinor = active.reduce((sum, invoice) => safe(sum, subtract(invoice.totalMinor, paidByInvoice.get(invoice.id) ?? 0)), 0)
  const statusCounts = active.reduce((counts, invoice) => {
    const paidMinor = paidByInvoice.get(invoice.id) ?? 0
    const status = invoice.totalMinor === 0 ? 'pending' : deriveStatus(invoice.totalMinor, paidMinor)
    return { ...counts, [status]: counts[status] + 1 }
  }, { pending: 0, partially_paid: 0, paid: 0 })
  const week = dateRangeFor('week', input.today)
  const weeklyIncome = Array.from({ length: 7 }, (_, index) => { const date = addDays(week.start, index); return { date, amountMinor: input.incomes.filter((income) => income.saleDate === date).reduce((sum, income) => safe(sum, income.amountMinor), 0) } })
  const categoryMap = new Map<string, Category>(input.categories.map((category) => [category.id, category]))
  const categoryTotals = new Map<string, number>()
  for (const payment of periodPayments) {
    const invoice = active.find((candidate) => candidate.id === payment.invoiceId)!; const lines = input.lines.filter((line) => line.invoiceId === invoice.id).sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)); const total = lines.reduce((sum, line) => safe(sum, line.lineTotalMinor), 0)
    if (total === 0) continue
    const shares = lines.map((line) => ({ line, amount: proportionalShare(payment.amountMinor, line.lineTotalMinor, total) })); let remainder = subtract(payment.amountMinor, shares.reduce((sum, share) => safe(sum, share.amount), 0))
    shares.forEach((share) => { if (remainder > 0) { share.amount++; remainder-- }; if (share.amount > 0) categoryTotals.set(share.line.categoryId, safe(categoryTotals.get(share.line.categoryId) ?? 0, share.amount)) })
  }
  const categoryBreakdown = [...categoryTotals].map(([categoryId, amountMinor]) => ({ categoryId, name: categoryMap.get(categoryId)?.name ?? categoryId, amountMinor })).sort((a, b) => b.amountMinor - a.amountMinor || a.name.localeCompare(b.name) || a.categoryId.localeCompare(b.categoryId))
  const latestInvoices = active.map((invoice) => {
    const paidMinor = paidByInvoice.get(invoice.id) ?? 0
    return { invoice, outstandingMinor: subtract(invoice.totalMinor, paidMinor), status: invoice.totalMinor === 0 ? 'pending' : deriveStatus(invoice.totalMinor, paidMinor) }
  }).sort((a, b) => b.invoice.issueDate.localeCompare(a.invoice.issueDate) || b.invoice.createdAt.localeCompare(a.invoice.createdAt) || a.invoice.id.localeCompare(b.invoice.id)).slice(0, 10)
  return { range, metrics: { incomeMinor, paidExpensesMinor, estimatedCashResultMinor: subtract(incomeMinor, paidExpensesMinor), outstandingMinor }, statusCounts, weeklyIncome, categoryBreakdown, latestInvoices, inactive: !input.incomes.some((income) => inRange(income.saleDate, { start: addDays(input.today, -6), end: input.today })) }
}
