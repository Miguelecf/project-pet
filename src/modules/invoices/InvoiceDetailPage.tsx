import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StateOverlay } from '../../components/StateOverlay'
import type { Category, Payment, Supplier } from '../../types/domain'
import { statusLabel, derivedInvoiceStatus } from './invoicePresentation'
import type { InvoiceWithLines } from './InvoiceRepository'
import { useRepositories } from '../../app/useRepositories'

interface InvoiceDetailPageProps { readonly invoiceId: string }

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const { repositories } = useRepositories()
  const [detail, setDetail] = useState<InvoiceWithLines | null | undefined>(undefined)
  const [payments, setPayments] = useState<readonly Payment[]>([])
  const [suppliers, setSuppliers] = useState<readonly Supplier[]>([])
  const [categories, setCategories] = useState<readonly Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setDetail(undefined)
    setError(null)
    void Promise.all([repositories.invoices.findById(invoiceId as never), repositories.payments.findByInvoice(invoiceId as never), repositories.suppliers.findAll(), repositories.categories.findAll()])
      .then(([nextDetail, nextPayments, nextSuppliers, nextCategories]) => {
        if (!active) return
        setDetail(nextDetail)
        setPayments(nextPayments)
        setSuppliers(nextSuppliers)
        setCategories(nextCategories)
      })
      .catch((reason) => { if (active) { setDetail(null); setError(reason instanceof Error ? reason.message : 'Could not load invoice') } })
    return () => { active = false }
  }, [attempt, invoiceId, repositories])

  if (detail === undefined) return <StateOverlay state="loading"><section aria-label="Invoice detail" /></StateOverlay>
  if (error) return <StateOverlay error={error} onRetry={() => setAttempt((current) => current + 1)} state="error"><section aria-label="Invoice detail" /></StateOverlay>
  if (!detail) return <section><h1>Invoice not found.</h1><Link to="/invoices">Back to invoices</Link></section>

  const { invoice, lines } = detail
  const status = derivedInvoiceStatus(invoice.totalMinor, payments)
  const paidMinor = payments.filter((payment) => !payment.isVoid).reduce((total, payment) => total + (payment.amountMinor as number), 0)
  const activePayments = payments.some((payment) => !payment.isVoid)
  const supplierName = suppliers.find((supplier) => supplier.id === invoice.supplierId)?.name ?? 'Unknown supplier'

  return <section aria-labelledby="invoice-detail-title" className="invoice-detail-page">
    <p className="eyebrow">Invoices</p>
    <h1 id="invoice-detail-title">{invoice.docRef ?? `Invoice ${invoice.id}`}</h1>
    <p>Supplier: {supplierName}</p><p>Issue date: {invoice.issueDate}</p>{invoice.dueDate && <p>Due date: {invoice.dueDate}</p>}
    <p aria-label={`Status: ${statusLabel(status)}`}>{statusLabel(status)}</p>
    {!activePayments && <Link to={`/invoices/${invoice.id}/edit`}>Edit invoice</Link>}
    <h2>Lines</h2><ul aria-label="Invoice lines">{lines.map((line) => <li key={line.id}><strong>{line.description}</strong><span>Category: {categories.find((category) => category.id === line.categoryId)?.name ?? 'Unknown category'}</span><span>Product: {line.productRef}</span><span>Quantity: {line.quantity}</span><span>Line total: {line.lineTotalMinor}</span></li>)}</ul>
    <h2>Payments</h2>{payments.length === 0 ? <p>No payments recorded.</p> : <ul aria-label="Payment history">{payments.map((payment) => <li key={payment.id}>{payment.method.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase())}: {payment.amountMinor}{payment.isVoid ? ' (voided)' : ''}</li>)}</ul>}
    <p>Total: {invoice.totalMinor}</p><p>Paid: {paidMinor}</p><p>Balance: {invoice.totalMinor - paidMinor}</p>
  </section>
}
