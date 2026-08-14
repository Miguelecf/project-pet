import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { Supplier } from '../../types/domain'
import { validateNonEmpty } from '../../utils/validation'
import { userFacingError } from '../../utils/userFacingErrors'
import { useSuppliers } from './useSuppliers'

interface SupplierFormProps {
  readonly supplier?: Supplier
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const navigate = useNavigate()
  const { create, softDelete, update } = useSuppliers()
  const [name, setName] = useState(supplier?.name ?? '')
  const [defaultDueDays, setDefaultDueDays] = useState(supplier?.defaultDueDays?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function save() {
    try {
      const trimmedName = validateNonEmpty(name)
      const dueDays = defaultDueDays.trim() === '' ? null : Number(defaultDueDays)
      if (dueDays !== null && (!Number.isSafeInteger(dueDays) || dueDays <= 0)) throw new RangeError('Los días de plazo deben ser un número entero mayor que cero')
      setError(null)
      if (supplier) await update(supplier.id, { name: trimmedName, defaultDueDays: dueDays as never })
      else await create({ name: trimmedName, defaultDueDays: dueDays as never })
      navigate('/suppliers')
    } catch (reason) {
      const message = userFacingError(reason, 'No pudimos guardar el proveedor')
      setError(message === 'Completá este campo' ? 'Completá el nombre del proveedor' : message)
    }
  }

  async function confirmDelete() {
    if (!supplier) return
    try {
      await softDelete(supplier.id)
      navigate('/suppliers')
    } catch (reason) {
      setDeleteOpen(false)
      setError(reason instanceof Error ? reason.message : 'No pudimos eliminar el proveedor')
    }
  }

  return (
    <section aria-labelledby="supplier-form-title" className="supplier-form">
      <p className="eyebrow">Catálogo</p>
      <h1 id="supplier-form-title">{supplier ? 'Editar proveedor' : 'Crear proveedor'}</h1>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="supplier-name">Nombre del proveedor</label>
      <input aria-invalid={error?.includes('nombre') || undefined} id="supplier-name" name="supplier-name" onChange={(event) => setName(event.target.value)} value={name} />
      <label htmlFor="supplier-due-days">Plazo habitual de pago (días, opcional)</label>
      <input id="supplier-due-days" inputMode="numeric" name="supplier-due-days" onChange={(event) => setDefaultDueDays(event.target.value)} value={defaultDueDays} />
      <div className="supplier-form__actions">
        <button onClick={() => void save()} type="button">Guardar</button>
        <button onClick={() => navigate('/suppliers')} type="button">Cancelar</button>
        {supplier && <button onClick={() => setDeleteOpen(true)} type="button">Eliminar proveedor</button>}
      </div>
      <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Eliminar" message={`¿Eliminar ${supplier?.name ?? 'este proveedor'}?`} onCancel={() => setDeleteOpen(false)} onConfirm={() => void confirmDelete()} open={deleteOpen} title="Eliminar proveedor" />
    </section>
  )
}
