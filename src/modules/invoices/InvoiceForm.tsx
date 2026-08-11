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
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load invoice form') })
    if (invoice) {
      void repositories.payments.findByInvoice(invoice.id).then((payments) => {
        if (active && payments.some((payment) => !payment.isVoid)) {
          setBlocked(true)
          setError('Void all payments before editing')
        }
      }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not check invoice payments') })
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
      setError(reason instanceof Error ? reason.message : 'Could not save invoice')
    }
  }

  return (
    <section aria-labelledby="invoice-form-title" className="invoice-form">
      <p className="eyebrow">Invoices</p>
      <h1 id="invoice-form-title">{invoice ? 'Edit invoice' : 'Create invoice'}</h1>
      {error && <p role="alert">{error}</p>}
      <label>Supplier<select aria-label="Supplier" disabled={blocked} onChange={(event) => setSupplierId(event.target.value)} value={supplierId}><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
      <label>Issue date<input aria-label="Issue date" disabled={blocked} onChange={(event) => setIssueDate(event.target.value)} type="date" value={issueDate} /></label>
      <label>Due date<input aria-label="Due date" disabled={blocked} onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label>
      <label>Document reference<input aria-label="Document reference" disabled={blocked} onChange={(event) => setDocRef(event.target.value)} value={docRef} /></label>
      <label>Notes<textarea aria-label="Notes" disabled={blocked} onChange={(event) => setNotes(event.target.value)} value={notes} /></label>
      <InvoiceLineEditor categories={categories} disabled={blocked} lines={lines} onChange={setLines} />
      <div className="invoice-form__actions">
        <button disabled={blocked} onClick={() => void save()} type="button">Save invoice</button>
        <button onClick={() => navigate('/invoices')} type="button">Cancel</button>
      </div>
    </section>
  )
}
