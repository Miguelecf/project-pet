import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRepositories } from '../../app/useRepositories'
import { StateOverlay } from '../../components/StateOverlay'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { Invoice, Payment } from '../../types/domain'
import { statusLabel, derivedInvoiceStatus } from './invoicePresentation'
import { useInvoices } from './useInvoices'

export function InvoiceListPage() {
  const navigate = useNavigate()
  const { repositories } = useRepositories()
  const { error, invoices, loading, refresh } = useInvoices()
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedInvoices, setDeletedInvoices] = useState<readonly Invoice[]>([])
  const [restoreTarget, setRestoreTarget] = useState<Invoice | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<Record<string, readonly Payment[]>>({})
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all(invoices.map(async (invoice) => [invoice.id, await repositories.payments.findByInvoice(invoice.id)] as const))
      .then((entries) => { if (active) setPaymentsByInvoice(Object.fromEntries(entries)) })
      .catch((reason) => { if (active) setPaymentError(reason instanceof Error ? reason.message : 'Could not load invoice payments') })
    return () => { active = false }
  }, [invoices, repositories])

  useEffect(() => {
    if (!showDeleted) return
    let active = true
    setMutationError(null)
    void repositories.invoices.findDeleted()
      .then((nextInvoices) => { if (active) setDeletedInvoices(nextInvoices) })
      .catch((reason) => { if (active) setMutationError(reason instanceof Error ? reason.message : 'Could not load deleted invoices') })
    return () => { active = false }
  }, [repositories, showDeleted])

  const displayedInvoices = showDeleted ? deletedInvoices : invoices

  async function restoreInvoice() {
    if (!restoreTarget) return
    try {
      await repositories.invoices.restore(restoreTarget.id)
      setRestoreTarget(null)
      setShowDeleted(false)
      void refresh()
    } catch (reason) {
      setRestoreTarget(null)
      setMutationError(reason instanceof Error ? reason.message : 'Could not restore invoice')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Invoice list" /></StateOverlay>
  const resolvedError = error ?? paymentError ?? mutationError
  if (resolvedError) return <StateOverlay error={resolvedError} onRetry={() => { setPaymentError(null); void refresh() }} state="error"><section aria-label="Invoice list" /></StateOverlay>
  if (!showDeleted && invoices.length === 0) return <StateOverlay emptyActionLabel="New Invoice" emptyMessage="No invoices yet." onEmptyAction={() => navigate('/invoices/new')} state="empty"><section aria-label="Invoice list" /></StateOverlay>

  return <section aria-labelledby="invoices-title" className="invoice-list-page">
    <p className="eyebrow">Invoices</p>
    <h1 id="invoices-title">Invoices</h1>
    <Link className="primary-action" to="/invoices/new">New Invoice</Link>
    <button aria-pressed={showDeleted} onClick={() => setShowDeleted((current) => !current)} type="button">{showDeleted ? 'Show active invoices' : 'Show deleted invoices'}</button>
    {showDeleted && displayedInvoices.length === 0 && <p>No deleted invoices.</p>}
    <ul aria-label="Invoices">
      {displayedInvoices.map((invoice) => {
        const status = derivedInvoiceStatus(invoice.totalMinor, paymentsByInvoice[invoice.id] ?? [])
        return <li key={invoice.id}><Link aria-label={invoice.docRef ?? `Invoice ${invoice.id}`} to={`/invoices/${invoice.id}`}>{invoice.docRef ?? `Invoice ${invoice.id}`}</Link><span aria-label={`Status: ${statusLabel(status)}`}>{statusLabel(status)}</span><span>Total: {invoice.totalMinor}</span>{showDeleted && <button onClick={() => setRestoreTarget(invoice)} type="button">Restore {invoice.docRef ?? `Invoice ${invoice.id}`}</button>}</li>
      })}
    </ul>
    <ConfirmDialog cancelLabel="Cancel" confirmLabel="Restore invoice" message="This invoice will return to the active invoice list." onCancel={() => setRestoreTarget(null)} onConfirm={() => void restoreInvoice()} open={restoreTarget !== null} title="Restore invoice?" />
  </section>
}
