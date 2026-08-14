import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StateOverlay } from '../../components/StateOverlay'
import type { Category, Payment, Supplier } from '../../types/domain'
import { statusLabel, derivedInvoiceStatus } from './invoicePresentation'
import type { InvoiceWithLines } from './InvoiceRepository'
import { useRepositories } from '../../app/useRepositories'
import { PaymentForm } from './PaymentForm'

const paymentMethodLabels = {
  cash: 'Efectivo',
  bank_transfer: 'Transferencia bancaria',
  debit_card: 'Tarjeta de débito',
  credit_card: 'Tarjeta de crédito',
  digital_wallet: 'Billetera virtual',
} as const

interface InvoiceDetailPageProps { readonly invoiceId: string }

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const navigate = useNavigate()
  const { repositories, revision } = useRepositories()
  const [detail, setDetail] = useState<InvoiceWithLines | null | undefined>(undefined)
  const [payments, setPayments] = useState<readonly Payment[]>([])
  const [suppliers, setSuppliers] = useState<readonly Supplier[]>([])
  const [categories, setCategories] = useState<readonly Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
      .catch((reason) => { if (active) { setDetail(null); setError(reason instanceof Error ? reason.message : 'No pudimos cargar la factura') } })
    return () => { active = false }
  }, [attempt, invoiceId, repositories, revision])

  if (detail === undefined) return <StateOverlay state="loading"><section aria-label="Detalle de factura" /></StateOverlay>
  if (error) return <StateOverlay error={error} onRetry={() => setAttempt((current) => current + 1)} state="error"><section aria-label="Detalle de factura" /></StateOverlay>
  if (!detail) return <section><h1>No encontramos la factura.</h1><Link to="/invoices">Volver a facturas</Link></section>

  const { invoice, lines } = detail
  const status = derivedInvoiceStatus(invoice.totalMinor, payments)
  const paidMinor = payments.filter((payment) => !payment.isVoid).reduce((total, payment) => total + (payment.amountMinor as number), 0)
  const activePayments = payments.some((payment) => !payment.isVoid)
  const supplierName = suppliers.find((supplier) => supplier.id === invoice.supplierId)?.name ?? 'Proveedor desconocido'

  async function deleteInvoice() {
    setDeleteOpen(false)
    setDeleteError(null)
    if (activePayments) {
      setDeleteError('No podés eliminarla: primero anulá todos los pagos')
      return
    }
    try {
      await repositories.invoices.softDelete(invoice.id)
      navigate('/invoices')
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : 'No pudimos eliminar la factura')
    }
  }

  return <section aria-labelledby="invoice-detail-title" className="invoice-detail-page">
    <p className="eyebrow">Facturas</p>
    <h1 id="invoice-detail-title">{invoice.docRef ?? `Factura ${invoice.id}`}</h1>
    <p>Proveedor: {supplierName}</p><p>Fecha de emisión: {invoice.issueDate}</p>{invoice.dueDate && <p>Fecha de vencimiento: {invoice.dueDate}</p>}
    <p aria-label={`Estado: ${statusLabel(status)}`}>{statusLabel(status)}</p>
    {!activePayments && <Link to={`/invoices/${invoice.id}/edit`}>Editar factura</Link>}
    {deleteError && <p role="alert">{deleteError}</p>}
    <button onClick={() => setDeleteOpen(true)} type="button">Eliminar factura</button>
    <h2>Líneas</h2><ul aria-label="Líneas de factura">{lines.map((line) => <li key={line.id}><strong>{line.description}</strong><span>Categoría: {categories.find((category) => category.id === line.categoryId)?.name ?? 'Categoría desconocida'}</span><span>Producto: {line.productRef}</span><span>Cantidad: {line.quantity}</span><span>Total de la línea: {line.lineTotalMinor}</span></li>)}</ul>
    <h2>Pagos</h2>{payments.length === 0 ? <p>No hay pagos registrados.</p> : <ul aria-label="Historial de pagos">{payments.map((payment) => <li key={payment.id}>{paymentMethodLabels[payment.method]}: {payment.amountMinor}{payment.isVoid ? ' (anulado)' : ''}</li>)}</ul>}
    <p>Total: {invoice.totalMinor}</p><p>Pagado: {paidMinor}</p><p>Saldo: {invoice.totalMinor - paidMinor}</p>
    <PaymentForm invoiceId={invoice.id} onChanged={() => setAttempt((current) => current + 1)} />
    <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Eliminar" message="Esta factura se conservará y podrás restaurarla más adelante." onCancel={() => setDeleteOpen(false)} onConfirm={() => void deleteInvoice()} open={deleteOpen} title="¿Eliminar factura?" />
  </section>
}
