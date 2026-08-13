import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepositories } from '../../app/useRepositories'
import { RestoreDemoData } from '../../app/RestoreDemoData'
import type { Clock } from '../../utils/dates'
import { DueAlerts } from './DueAlerts'
import { aggregateDashboard, type DashboardPeriod } from './dashboardAggregates'

export function DashboardPage({ clock }: { readonly clock: Clock }) {
  const { repositories, revision } = useRepositories(); const [period, setPeriod] = useState<DashboardPeriod>('month'); const [state, setState] = useState<ReturnType<typeof aggregateDashboard> | null>(null); const [error, setError] = useState(false); const [reload, setReload] = useState(0)
  const refresh = useCallback(async () => { try { setError(false); const [invoices, incomes, categories] = await Promise.all([repositories.invoices.findAll(), repositories.dailyIncomes.findAll(), repositories.categories.findAll()]); const records = await Promise.all(invoices.map(async (invoice) => { const [detail, payments] = await Promise.all([repositories.invoices.findById(invoice.id), repositories.payments.findByInvoice(invoice.id)]); return { lines: detail?.lines ?? [], payments } })); setState(aggregateDashboard({ today: clock.today(), period, invoices, incomes, categories, lines: records.flatMap((record) => record.lines), payments: records.flatMap((record) => record.payments) })); } catch { setError(true) } }, [clock, period, repositories])
  useEffect(() => { void refresh() }, [refresh, revision, reload])
  if (error) return <section><h1>Dashboard</h1><p role="alert">Could not load dashboard.</p><button onClick={() => setReload((value) => value + 1)}>Retry dashboard</button></section>
  if (!state) return <section aria-busy="true"><h1>Dashboard</h1><p>Loading dashboard</p></section>
  return <div className="dashboard-page"><header><p className="eyebrow">Local operations</p><h1>Dashboard</h1><fieldset><legend>Dashboard period</legend>{(['day', 'week', 'month'] as const).map((value) => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</fieldset><button onClick={() => setReload((value) => value + 1)}>Refresh dashboard</button></header>
    <section aria-label="Financial metrics"><h2>Financial overview</h2><p>Period income: {state.metrics.incomeMinor}</p><p>Paid expenses: {state.metrics.paidExpensesMinor}</p><p>Estimated cash result — not net profit: {state.metrics.estimatedCashResultMinor}</p><p>Total outstanding: {state.metrics.outstandingMinor}</p><p>Status counts: Pending {state.statusCounts.pending}, Partially paid {state.statusCounts.partially_paid}, Paid {state.statusCounts.paid}</p></section>
    {state.inactive && <p role="alert">No daily income recorded in the last 7 days.</p>}
    <section><h2>Current week income</h2><ul aria-label="Current week income">{state.weeklyIncome.map((day) => <li key={day.date}>{day.date}: {day.amountMinor}</li>)}</ul></section>
    <section><h2>Latest invoices</h2>{state.latestInvoices.length ? <ul aria-label="Latest invoices">{state.latestInvoices.map(({ invoice, status, outstandingMinor }) => <li key={invoice.id}><Link to={`/invoices/${invoice.id}`}>{invoice.docRef ?? 'Invoice'}</Link> — {invoice.issueDate} — {status} — {invoice.totalMinor} — Outstanding {outstandingMinor}</li>)}</ul> : <p>No invoices yet</p>}</section>
    <section><h2>Paid-expense categories</h2>{state.categoryBreakdown.length ? <ul aria-label="Paid-expense categories">{state.categoryBreakdown.map((category) => <li key={category.categoryId}>{category.name}: {category.amountMinor}</li>)}</ul> : <p>No paid-expense categories for this period</p>}</section>
    {state.latestInvoices.length === 0 && <p>Load seed data to explore the dashboard.</p>}<DueAlerts clock={clock} /><RestoreDemoData />
  </div>
}
