import type { Category } from '../../types/domain'
import { lineTotalMinor } from '../../utils/finance'

export interface InvoiceLineDraft {
  readonly categoryId: string
  readonly productRef: string
  readonly externalSku: string
  readonly description: string
  readonly quantity: string
  readonly unitCostMinor: string
}

interface InvoiceLineEditorProps {
  readonly categories: readonly Category[]
  readonly lines: readonly InvoiceLineDraft[]
  readonly onChange: (lines: readonly InvoiceLineDraft[]) => void
  readonly disabled?: boolean
}

const emptyLine: InvoiceLineDraft = { categoryId: '', productRef: '', externalSku: '', description: '', quantity: '1', unitCostMinor: '0' }

function validationError(line: InvoiceLineDraft): string | null {
  try {
    lineTotalMinor(Number(line.quantity), Number(line.unitCostMinor))
    return null
  } catch (reason) {
    return reason instanceof Error ? reason.message : 'Invalid line values'
  }
}

export function InvoiceLineEditor({ categories, lines, onChange, disabled = false }: InvoiceLineEditorProps) {
  function changeLine(index: number, field: keyof InvoiceLineDraft, value: string) {
    onChange(lines.map((line, current) => current === index ? { ...line, [field]: value } : line))
  }

  return (
    <fieldset>
      <legend>Invoice lines</legend>
      {lines.map((line, index) => {
        const error = validationError(line)
        const total = error === null ? lineTotalMinor(Number(line.quantity), Number(line.unitCostMinor)) : null
        return (
          <fieldset aria-label={`Invoice line ${index + 1}`} key={index}>
            <legend>Line {index + 1}</legend>
            <label>Category<select aria-label="Category" disabled={disabled} onChange={(event) => changeLine(index, 'categoryId', event.target.value)} value={line.categoryId}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Product reference<input aria-label="Product reference" disabled={disabled} onChange={(event) => changeLine(index, 'productRef', event.target.value)} value={line.productRef} /></label>
            <label>External SKU<input aria-label="External SKU" disabled={disabled} onChange={(event) => changeLine(index, 'externalSku', event.target.value)} value={line.externalSku} /></label>
            <label>Description<input aria-label="Description" disabled={disabled} onChange={(event) => changeLine(index, 'description', event.target.value)} value={line.description} /></label>
            <label>Quantity<input aria-label="Quantity" disabled={disabled} inputMode="decimal" onChange={(event) => changeLine(index, 'quantity', event.target.value)} value={line.quantity} /></label>
            <label>Unit cost (minor units)<input aria-label="Unit cost (minor units)" disabled={disabled} inputMode="numeric" onChange={(event) => changeLine(index, 'unitCostMinor', event.target.value)} value={line.unitCostMinor} /></label>
            {error ? <p role="alert">{error}</p> : <p>Line total: {total}</p>}
            {lines.length > 1 && <button disabled={disabled} onClick={() => onChange(lines.filter((_, current) => current !== index))} type="button">Remove line</button>}
          </fieldset>
        )
      })}
      <button disabled={disabled} onClick={() => onChange([...lines, emptyLine])} type="button">Add line</button>
    </fieldset>
  )
}
