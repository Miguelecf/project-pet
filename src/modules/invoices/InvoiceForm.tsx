import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRepositories } from '../../app/useRepositories'
import type { Category, Currency, Supplier } from '../../types/domain'
import { validateISODate, type Clock } from '../../utils/dates'
import { validateMoneyMinor, validateNonEmpty, validateQuantity } from '../../utils/validation'
import { userFacingError } from '../../utils/userFacingErrors'
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

function suggestDueDate(issueDate: string, defaultDueDays: number | null): string {
  if (!issueDate || defaultDueDays === null) return ''
  const [year, month, day] = issueDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + defaultDueDays))
  return date.toISOString().slice(0, 10)
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
  const [currency, setCurrency] = useState<Currency>('ARS')
  const [supplierId, setSupplierId] = useState(invoice?.supplierId ?? '')
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? '')
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? '')
  const [dueDateEdited, setDueDateEdited] = useState(Boolean(invoice?.dueDate))
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

  useEffect(() => {
    if (invoice || dueDateEdited) return
    const supplier = suppliers.find((candidate) => candidate.id === supplierId)
    const suggested = suggestDueDate(issueDate, supplier?.defaultDueDays ?? null)
    if (suggested) setDueDate(suggested)
  }, [dueDateEdited, invoice, issueDate, supplierId, suppliers])

  async function save() {
    if (blocked) return
    try {
      if (!supplierId) throw new RangeError('Seleccioná un proveedor')
      if (!issueDate) throw new RangeError('Completá la fecha de emisión')
      if (lines.length === 0) throw new RangeError('Agregá al menos una línea de factura')
      const input = {
        supplierId: validateNonEmpty(supplierId) as never,
        docRef: docRef.trim() || null,
        issueDate: validateISODate(issueDate, clock, { kind: 'issue' }),
        dueDate: dueDate ? validateISODate(dueDate, clock, { kind: 'due' }) : null,
        currency,
        notes: notes.trim() || null,
        lines: lines.map((line, index) => {
          if (!line.categoryId) throw new RangeError(`Seleccioná una categoría en la línea ${index + 1}`)
          if (!line.productRef.trim()) throw new RangeError(`Completá la referencia del producto en la línea ${index + 1}`)
          if (!line.description.trim()) throw new RangeError(`Completá la descripción en la línea ${index + 1}`)
          return {
          categoryId: validateNonEmpty(line.categoryId) as never,
          productRef: validateNonEmpty(line.productRef),
          externalSku: line.externalSku.trim() || null,
          description: validateNonEmpty(line.description),
          quantity: validateQuantity(Number(line.quantity)),
          unitCostMinor: validateMoneyMinor(Number(line.unitCostMinor)),
          }
        }),
      }
      if (invoice) await update(invoice.id, input)
      else await create(input)
      navigate('/invoices')
    } catch (reason) {
      setError(userFacingError(reason, 'No pudimos guardar la factura'))
    }
  }

  return (
    <section aria-labelledby="invoice-form-title" className="invoice-form">
      <p className="eyebrow">Facturas</p>
      <h1 id="invoice-form-title">{invoice ? 'Editar factura' : 'Crear factura'}</h1>
      {error && <p role="alert">{error}</p>}
      <label>Proveedor<select aria-label="Proveedor" disabled={blocked} onChange={(event) => { setSupplierId(event.target.value); setDueDateEdited(false) }} value={supplierId}><option value="">Seleccioná un proveedor</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
      <label>Fecha de emisión<input aria-label="Fecha de emisión" disabled={blocked} onChange={(event) => { setIssueDate(event.target.value); setDueDateEdited(false) }} type="date" value={issueDate} /></label>
      <label>Fecha de vencimiento<input aria-label="Fecha de vencimiento" disabled={blocked} onChange={(event) => { setDueDate(event.target.value); setDueDateEdited(true) }} type="date" value={dueDate} /></label>
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
