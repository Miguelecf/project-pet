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
  const [suppliers, setSuppliers] = useState<readonly { id: string; name: string }[]>([])

  useEffect(() => {
    let active = true
    void Promise.all(invoices.map(async (invoice) => [invoice.id, await repositories.payments.findByInvoice(invoice.id)] as const))
      .then((entries) => { if (active) setPaymentsByInvoice(Object.fromEntries(entries)) })
      .catch((reason) => { if (active) setPaymentError(reason instanceof Error ? reason.message : 'No pudimos cargar los pagos de las facturas') })
    return () => { active = false }
  }, [invoices, repositories])

  useEffect(() => {
    if (!repositories.suppliers) return
    void repositories.suppliers.findAll().then((nextSuppliers) => setSuppliers(nextSuppliers)).catch(() => setSuppliers([]))
  }, [repositories])

  useEffect(() => {
    if (!showDeleted) return
    let active = true
    setMutationError(null)
    void repositories.invoices.findDeleted()
      .then((nextInvoices) => { if (active) setDeletedInvoices(nextInvoices) })
      .catch((reason) => { if (active) setMutationError(reason instanceof Error ? reason.message : 'No pudimos cargar las facturas eliminadas') })
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
      setMutationError(reason instanceof Error ? reason.message : 'No pudimos restaurar la factura')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Lista de facturas" /></StateOverlay>
  const resolvedError = error ?? paymentError ?? mutationError
  if (resolvedError) return <StateOverlay error={resolvedError} onRetry={() => { setPaymentError(null); void refresh() }} state="error"><section aria-label="Lista de facturas" /></StateOverlay>
  if (!showDeleted && invoices.length === 0) return <StateOverlay emptyActionLabel="Crear factura" emptyMessage="Todavía no hay facturas." onEmptyAction={() => navigate('/invoices/new')} state="empty"><section aria-label="Lista de facturas" /></StateOverlay>

  return <section aria-labelledby="invoices-title" className="invoice-list-page">
    <p className="eyebrow">Facturas</p>
    <h1 id="invoices-title">Facturas</h1>
    <Link className="primary-action" to="/invoices/new">Crear factura</Link>
    <button aria-pressed={showDeleted} onClick={() => setShowDeleted((current) => !current)} type="button">{showDeleted ? 'Ver facturas activas' : 'Ver facturas eliminadas'}</button>
    {showDeleted && displayedInvoices.length === 0 && <p>No hay facturas eliminadas.</p>}
     <div className="data-table-wrap">
     <table aria-label="Facturas" className="data-table data-table--invoices">
       <thead><tr><th scope="col">Factura</th><th scope="col">Proveedor</th><th scope="col">Emisión</th><th scope="col">Vencimiento</th><th scope="col">Estado</th><th scope="col">Total</th><th scope="col">Saldo</th><th scope="col">Acciones</th></tr></thead>
       <tbody>
       {displayedInvoices.map((invoice) => {
         const status = derivedInvoiceStatus(invoice.totalMinor, paymentsByInvoice[invoice.id] ?? [])
         const supplier = suppliers.find((candidate) => candidate.id === invoice.supplierId)
         const paid = (paymentsByInvoice[invoice.id] ?? []).reduce((total, payment) => payment.isVoid ? total : total + payment.amountMinor, 0)
         return <tr key={invoice.id}><th scope="row"><Link aria-label={invoice.docRef ?? `Factura ${invoice.id}`} to={`/invoices/${invoice.id}`}>{invoice.docRef ?? `Factura ${invoice.id}`}</Link></th><td>{supplier?.name ?? 'Sin proveedor'}</td><td>{invoice.issueDate}</td><td>{invoice.dueDate ?? 'Sin fecha'}</td><td><span aria-label={`Estado: ${statusLabel(status)}`} className={`invoice-status invoice-status--${status}`}>{statusLabel(status)}</span></td><td>{invoice.totalMinor}</td><td>{Math.max(0, invoice.totalMinor - paid)}</td><td>{showDeleted && <button onClick={() => setRestoreTarget(invoice)} type="button">Restaurar</button>}</td></tr>
       })}
       </tbody>
     </table>
     </div>
    <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Restaurar" message="Esta factura volverá a la lista de facturas activas." onCancel={() => setRestoreTarget(null)} onConfirm={() => void restoreInvoice()} open={restoreTarget !== null} title="¿Restaurar factura?" />
  </section>
}
