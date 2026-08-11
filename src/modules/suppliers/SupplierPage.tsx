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
      setMutationError(reason instanceof Error ? reason.message : 'Could not delete supplier')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Supplier list" /></StateOverlay>
  const error = mutationError ?? loadError
  if (error) return <StateOverlay error={error} onRetry={() => { setMutationError(null); void refresh() }} state="error"><section aria-label="Supplier list" /></StateOverlay>
  const activeSuppliers = suppliers.filter((supplier) => supplier.deletedAt === null)
  if (activeSuppliers.length === 0) return <StateOverlay emptyActionLabel="Create Supplier" emptyMessage="No suppliers yet." onEmptyAction={() => navigate('/suppliers/new')} state="empty"><section aria-label="Supplier list" /></StateOverlay>

  return (
    <section aria-labelledby="suppliers-title" className="supplier-page">
      <p className="eyebrow">Catalog</p>
      <h1 id="suppliers-title">Suppliers</h1>
      <Link className="primary-action" to="/suppliers/new">Create Supplier</Link>
      <ul aria-label="Suppliers" className="supplier-list">
        {activeSuppliers.map((supplier) => (
          <li key={supplier.id}>
            <span>{supplier.name}</span>
            <div>
              <Link aria-label={`Edit ${supplier.name}`} to={`/suppliers/${supplier.id}/edit`}>Edit</Link>
              <button aria-label={`Delete ${supplier.name}`} onClick={() => setDeleting(supplier)} type="button">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog cancelLabel="Cancel" confirmLabel="Delete" message={`Delete ${deleting?.name ?? 'supplier'}?`} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} open={deleting !== null} title="Delete supplier" />
    </section>
  )
}
