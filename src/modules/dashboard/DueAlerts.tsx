import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepositories } from '../../app/useRepositories'
import type { Invoice, ISODate, MoneyMinor } from '../../types/domain'
import type { Clock } from '../../utils/dates'

export interface DueAlert {
  readonly invoice: Invoice
  readonly outstandingMinor: MoneyMinor
  readonly kind: 'overdue' | 'due-soon'
}

function dueAlertsFor(
  invoices: readonly Invoice[],
  paidByInvoice: ReadonlyMap<string, number>,
  today: ISODate,
  dueAlertDays: number,
): readonly DueAlert[] {
  const boundary = addCalendarDays(today, dueAlertDays)

  return invoices
    .filter((invoice) => invoice.deletedAt === null && invoice.dueDate !== null)
    .map((invoice) => ({ invoice, outstandingMinor: invoice.totalMinor - (paidByInvoice.get(invoice.id) ?? 0) }))
    .filter(({ invoice, outstandingMinor }) => outstandingMinor > 0 && invoice.dueDate! <= boundary)
    .map(({ invoice, outstandingMinor }) => ({
      invoice,
      outstandingMinor: outstandingMinor as MoneyMinor,
      kind: (invoice.dueDate! < today ? 'overdue' : 'due-soon') as DueAlert['kind'],
    }))
    .sort((left, right) => left.invoice.dueDate!.localeCompare(right.invoice.dueDate!))
}

function addCalendarDays(date: ISODate, days: number): ISODate {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day + days))
  return value.toISOString().slice(0, 10) as ISODate
}

export function DueAlerts({ clock }: { readonly clock: Clock }) {
  const { repositories, revision } = useRepositories()
  const [alerts, setAlerts] = useState<readonly DueAlert[]>([])

  const refresh = useCallback(async () => {
    const [invoices, settings] = await Promise.all([
      repositories.invoices.findAll(),
      repositories.settings.get(),
    ])
    const paidByInvoice = new Map<string, number>()
    await Promise.all(invoices.map(async (invoice) => {
      const payments = await repositories.payments.findByInvoice(invoice.id)
      paidByInvoice.set(invoice.id, payments.reduce((total, payment) => payment.isVoid ? total : total + payment.amountMinor, 0))
    }))
    setAlerts(dueAlertsFor(invoices, paidByInvoice, clock.today(), settings.dueAlertDays))
  }, [clock, repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  return (
    <section aria-labelledby="due-alerts-title">
      <h2 id="due-alerts-title">Due-date alerts</h2>
      {alerts.length === 0 ? (
        <p>No upcoming or overdue invoices</p>
      ) : (
        <ul aria-label="Due-date alerts">
          {alerts.map(({ invoice, kind, outstandingMinor }) => (
            <li key={invoice.id}>
              <Link to={`/invoices/${invoice.id}`}>{invoice.docRef ?? 'Invoice'}</Link>
              <span
                aria-label={kind === 'overdue' ? 'Overdue' : 'Due soon'}
                className={kind === 'overdue' ? 'due-alert-badge due-alert-badge--overdue' : 'due-alert-badge'}
              >
                {kind === 'overdue' ? 'Overdue' : 'Due soon'}
              </span>
              <span>Due date: {invoice.dueDate}</span>
              <span>Outstanding balance: {outstandingMinor}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
