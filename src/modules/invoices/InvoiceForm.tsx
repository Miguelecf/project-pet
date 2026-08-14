import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRepositories } from '../../app/useRepositories'
import type { Category, Currency, Supplier } from '../../types/domain'
import { validateISODate, type Clock } from '../../utils/dates'
import { validateMoneyMinor, validateNonEmpty, validateQuantity } from '../../utils/validation'
import { InvoiceLineEditor, type InvoiceLineDraft } from './InvoiceLineEditor'
import type { InvoiceWithLines } from './InvoiceRepository'
import { useInvoices } from './useInvoices'

interface InvoiceFormProps {
  readonly invoice?: InvoiceWithLines
  readonly clock?: Clock
}

function systemClock(): Clock {
  return { today: () => new Date().toISOString().slice(0, 10) as never }
}

function draftFromInvoice(invoice?: InvoiceWithLines): readonly InvoiceLineDraft[] {
  return invoice?.lines.map((line) => ({
    categoryId: line.categoryId,
    productRef: line.productRef,
    externalSku: line.externalSku ?? '',
    description: line.description,
    quantity: String(line.quantity),
    unitCostMinor: String(line.unitCostMinor),
  })) ?? []
}

export function InvoiceForm({ invoice: invoiceWithLines, clock = systemClock() }: InvoiceFormProps) {
  const navigate = useNavigate()
  const { repositories } = useRepositories()
  const { create, update } = useInvoices()
  const invoice = invoiceWithLines?.invoice
  const [suppliers, setSuppliers] = useState<readonly Supplier[]>([])
  const [categories, setCategories] = useState<readonly Category[]>([])
  const [currency, setCurrency] = useState<Currency>('USD')
  const [supplierId, setSupplierId] = useState(invoice?.supplierId ?? '')
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? '')
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? '')
  const [docRef, setDocRef] = useState(invoice?.docRef ?? '')
  const [notes, setNotes] = useState(invoice?.notes ?? '')
  const [lines, setLines] = useState<readonly InvoiceLineDraft[]>(() => draftFromInvoice(invoiceWithLines))
  const [blocked, setBlocked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([repositories.suppliers.findAll(), repositories.categories.findAll(), repositories.settings.get()])
      .then(([nextSuppliers, nextCategories, settings]) => {
        if (!active) return
        setSuppliers(nextSuppliers)
        setCategories(nextCategories)
        setCurrency(settings.currency)
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'No pudimos cargar el formulario de factura') })
    if (invoice) {
      void repositories.payments.findByInvoice(invoice.id).then((payments) => {
        if (active && payments.some((payment) => !payment.isVoid)) {
          setBlocked(true)
          setError('Anulá todos los pagos antes de editar')
        }
      }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'No pudimos verificar los pagos de la factura') })
    }
    return () => { active = false }
  }, [invoice, repositories])

  async function save() {
    if (blocked) return
    try {
      if (lines.length === 0) throw new RangeError('Invoice requires at least one line')
      const input = {
        supplierId: validateNonEmpty(supplierId) as never,
        docRef: docRef.trim() || null,
        issueDate: validateISODate(issueDate, clock, { kind: 'issue' }),
        dueDate: dueDate ? validateISODate(dueDate, clock, { kind: 'due' }) : null,
        currency,
        notes: notes.trim() || null,
        lines: lines.map((line) => ({
          categoryId: validateNonEmpty(line.categoryId) as never,
          productRef: validateNonEmpty(line.productRef),
          externalSku: line.externalSku.trim() || null,
          description: validateNonEmpty(line.description),
          quantity: validateQuantity(Number(line.quantity)),
          unitCostMinor: validateMoneyMinor(Number(line.unitCostMinor)),
        })),
      }
      if (invoice) await update(invoice.id, input)
      else await create(input)
      navigate('/invoices')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar la factura')
    }
  }

  return (
    <section aria-labelledby="invoice-form-title" className="invoice-form">
      <p className="eyebrow">Facturas</p>
      <h1 id="invoice-form-title">{invoice ? 'Editar factura' : 'Crear factura'}</h1>
      {error && <p role="alert">{error}</p>}
      <label>Proveedor<select aria-label="Proveedor" disabled={blocked} onChange={(event) => setSupplierId(event.target.value)} value={supplierId}><option value="">Seleccioná un proveedor</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
      <label>Fecha de emisión<input aria-label="Fecha de emisión" disabled={blocked} onChange={(event) => setIssueDate(event.target.value)} type="date" value={issueDate} /></label>
      <label>Fecha de vencimiento<input aria-label="Fecha de vencimiento" disabled={blocked} onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label>
      <label>Referencia del documento<input aria-label="Referencia del documento" disabled={blocked} onChange={(event) => setDocRef(event.target.value)} value={docRef} /></label>
      <label>Notas<textarea aria-label="Notas" disabled={blocked} onChange={(event) => setNotes(event.target.value)} value={notes} /></label>
      <InvoiceLineEditor categories={categories} disabled={blocked} lines={lines} onChange={setLines} />
      <div className="invoice-form__actions">
        <button disabled={blocked} onClick={() => void save()} type="button">Guardar</button>
        <button onClick={() => navigate('/invoices')} type="button">Cancelar</button>
      </div>
    </section>
  )
}
