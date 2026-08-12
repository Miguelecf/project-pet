import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRepositories } from '../../app/useRepositories'
import { StateOverlay } from '../../components/StateOverlay'
import type { Payment } from '../../types/domain'
import { statusLabel, derivedInvoiceStatus } from './invoicePresentation'
import { useInvoices } from './useInvoices'

export function InvoiceListPage() {
  const navigate = useNavigate()
  const { repositories } = useRepositories()
  const { error, invoices, loading, refresh } = useInvoices()
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<Record<string, readonly Payment[]>>({})
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all(invoices.map(async (invoice) => [invoice.id, await repositories.payments.findByInvoice(invoice.id)] as const))
      .then((entries) => { if (active) setPaymentsByInvoice(Object.fromEntries(entries)) })
      .catch((reason) => { if (active) setPaymentError(reason instanceof Error ? reason.message : 'Could not load invoice payments') })
    return () => { active = false }
  }, [invoices, repositories])

  if (loading) return <StateOverlay state="loading"><section aria-label="Invoice list" /></StateOverlay>
  const resolvedError = error ?? paymentError
  if (resolvedError) return <StateOverlay error={resolvedError} onRetry={() => { setPaymentError(null); void refresh() }} state="error"><section aria-label="Invoice list" /></StateOverlay>
  if (invoices.length === 0) return <StateOverlay emptyActionLabel="New Invoice" emptyMessage="No invoices yet." onEmptyAction={() => navigate('/invoices/new')} state="empty"><section aria-label="Invoice list" /></StateOverlay>

  return <section aria-labelledby="invoices-title" className="invoice-list-page">
    <p className="eyebrow">Invoices</p>
    <h1 id="invoices-title">Invoices</h1>
    <Link className="primary-action" to="/invoices/new">New Invoice</Link>
    <ul aria-label="Invoices">
      {invoices.map((invoice) => {
        const status = derivedInvoiceStatus(invoice.totalMinor, paymentsByInvoice[invoice.id] ?? [])
        return <li key={invoice.id}><Link aria-label={invoice.docRef ?? `Invoice ${invoice.id}`} to={`/invoices/${invoice.id}`}>{invoice.docRef ?? `Invoice ${invoice.id}`}</Link><span aria-label={`Status: ${statusLabel(status)}`}>{statusLabel(status)}</span><span>Total: {invoice.totalMinor}</span></li>
      })}
    </ul>
  </section>
}
