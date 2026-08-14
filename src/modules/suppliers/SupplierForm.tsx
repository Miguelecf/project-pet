import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { Supplier } from '../../types/domain'
import { useSuppliers } from './useSuppliers'

interface SupplierFormProps {
  readonly supplier?: Supplier
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const navigate = useNavigate()
  const { create, softDelete, update } = useSuppliers()
  const [name, setName] = useState(supplier?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function save() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('El nombre del proveedor es obligatorio')
      return
    }
    setError(null)
    try {
      if (supplier) await update(supplier.id, { name: trimmedName, defaultDueDays: supplier.defaultDueDays })
      else await create({ name: trimmedName, defaultDueDays: null })
      navigate('/suppliers')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar el proveedor')
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
      <input id="supplier-name" name="supplier-name" onChange={(event) => setName(event.target.value)} value={name} />
      <div className="supplier-form__actions">
        <button onClick={() => void save()} type="button">Guardar</button>
        <button onClick={() => navigate('/suppliers')} type="button">Cancelar</button>
        {supplier && <button onClick={() => setDeleteOpen(true)} type="button">Eliminar proveedor</button>}
      </div>
      <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Eliminar" message={`¿Eliminar ${supplier?.name ?? 'este proveedor'}?`} onCancel={() => setDeleteOpen(false)} onConfirm={() => void confirmDelete()} open={deleteOpen} title="Eliminar proveedor" />
    </section>
  )
}
