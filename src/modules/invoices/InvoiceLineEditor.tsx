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
    return reason instanceof Error ? reason.message : 'Los valores de la línea no son válidos'
  }
}

export function InvoiceLineEditor({ categories, lines, onChange, disabled = false }: InvoiceLineEditorProps) {
  function changeLine(index: number, field: keyof InvoiceLineDraft, value: string) {
    onChange(lines.map((line, current) => current === index ? { ...line, [field]: value } : line))
  }

  return (
    <fieldset>
      <legend>Líneas de factura</legend>
      {lines.map((line, index) => {
        const error = validationError(line)
        const total = error === null ? lineTotalMinor(Number(line.quantity), Number(line.unitCostMinor)) : null
        return (
          <fieldset aria-label={`Línea de factura ${index + 1}`} key={index}>
            <legend>Línea {index + 1}</legend>
            <label>Categoría<select aria-label="Categoría" disabled={disabled} onChange={(event) => changeLine(index, 'categoryId', event.target.value)} value={line.categoryId}><option value="">Seleccioná una categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Referencia del producto<input aria-label="Referencia del producto" disabled={disabled} onChange={(event) => changeLine(index, 'productRef', event.target.value)} value={line.productRef} /></label>
            <label>SKU externo<input aria-label="SKU externo" disabled={disabled} onChange={(event) => changeLine(index, 'externalSku', event.target.value)} value={line.externalSku} /></label>
            <label>Descripción<input aria-label="Descripción" disabled={disabled} onChange={(event) => changeLine(index, 'description', event.target.value)} value={line.description} /></label>
            <label>Cantidad<input aria-label="Cantidad" disabled={disabled} inputMode="decimal" onChange={(event) => changeLine(index, 'quantity', event.target.value)} value={line.quantity} /></label>
            <label>Costo unitario (unidades mínimas)<input aria-label="Costo unitario (unidades mínimas)" disabled={disabled} inputMode="numeric" onChange={(event) => changeLine(index, 'unitCostMinor', event.target.value)} value={line.unitCostMinor} /></label>
            {error ? <p role="alert">{error}</p> : <p>Total de la línea: {total}</p>}
            {lines.length > 1 && <button disabled={disabled} onClick={() => onChange(lines.filter((_, current) => current !== index))} type="button">Quitar línea</button>}
          </fieldset>
        )
      })}
      <button disabled={disabled} onClick={() => onChange([...lines, emptyLine])} type="button">Agregar línea</button>
    </fieldset>
  )
}
