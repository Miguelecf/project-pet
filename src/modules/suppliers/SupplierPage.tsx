import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StateOverlay } from '../../components/StateOverlay'
import type { Supplier } from '../../types/domain'
import { useSuppliers } from './useSuppliers'

export function SupplierPage() {
  const navigate = useNavigate()
  const { error: loadError, loading, refresh, softDelete, suppliers } = useSuppliers()
  const [deleting, setDeleting] = useState<Supplier | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  async function confirmDelete() {
    if (!deleting) return
    try {
      await softDelete(deleting.id)
      setDeleting(null)
    } catch (reason) {
      setDeleting(null)
      setMutationError(reason instanceof Error ? reason.message : 'No pudimos eliminar el proveedor')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Lista de proveedores" /></StateOverlay>
  const error = mutationError ?? loadError
  if (error) return <StateOverlay error={error} onRetry={() => { setMutationError(null); void refresh() }} state="error"><section aria-label="Lista de proveedores" /></StateOverlay>
  const activeSuppliers = suppliers.filter((supplier) => supplier.deletedAt === null)
  if (activeSuppliers.length === 0) return <StateOverlay emptyActionLabel="Crear proveedor" emptyMessage="Todavía no hay proveedores." onEmptyAction={() => navigate('/suppliers/new')} state="empty"><section aria-label="Lista de proveedores" /></StateOverlay>

  return (
    <section aria-labelledby="suppliers-title" className="supplier-page">
      <p className="eyebrow">Catálogo</p>
      <h1 id="suppliers-title">Proveedores</h1>
      <Link className="primary-action" to="/suppliers/new">Crear proveedor</Link>
      <ul aria-label="Proveedores" className="supplier-list">
        {activeSuppliers.map((supplier) => (
          <li key={supplier.id}>
            <span>{supplier.name}</span>
            <div>
              <Link aria-label={`Editar ${supplier.name}`} to={`/suppliers/${supplier.id}/edit`}>Editar</Link>
              <button aria-label={`Eliminar ${supplier.name}`} onClick={() => setDeleting(supplier)} type="button">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Eliminar" message={`¿Eliminar ${deleting?.name ?? 'este proveedor'}?`} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} open={deleting !== null} title="Eliminar proveedor" />
    </section>
  )
}
