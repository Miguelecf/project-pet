import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StateOverlay } from '../../components/StateOverlay'
import type { Category } from '../../types/domain'
import { useCategories } from './useCategories'

export function CategoryPage() {
  const navigate = useNavigate()
  const { categories, error: loadError, isReferenced, loading, refresh, remove } = useCategories()
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  async function requestDelete(category: Category) {
    try {
      const references = await isReferenced(category.id)
      if (references > 0) {
        setMutationError(`No podés eliminarla porque está usada en ${references} línea(s) de factura`)
        return
      }
      setDeleting(category)
    } catch (reason) {
      setMutationError(reason instanceof Error ? reason.message : 'No pudimos verificar las referencias de la categoría')
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
      setDeleting(null)
    } catch (reason) {
      setDeleting(null)
      setMutationError(reason instanceof Error ? reason.message : 'No pudimos eliminar la categoría')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Lista de categorías" /></StateOverlay>
  const error = mutationError ?? loadError
  if (error) return <StateOverlay error={error} onRetry={() => { setMutationError(null); void refresh() }} state="error"><section aria-label="Lista de categorías" /></StateOverlay>
  if (categories.length === 0) return <StateOverlay emptyActionLabel="Crear categoría" emptyMessage="Todavía no hay categorías." onEmptyAction={() => navigate('/categories/new')} state="empty"><section aria-label="Lista de categorías" /></StateOverlay>

  return (
    <section aria-labelledby="categories-title" className="category-page">
      <p className="eyebrow">Catálogo</p>
      <h1 id="categories-title">Categorías</h1>
      <Link className="primary-action" to="/categories/new">Crear categoría</Link>
      <div className="data-table-wrap">
      <table aria-label="Categorías" className="data-table">
        <thead><tr><th scope="col">Categoría</th><th scope="col">Acciones</th></tr></thead>
        <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <th scope="row">{category.name}</th>
            <td>
              <Link aria-label={`Editar ${category.name}`} to={`/categories/${category.id}/edit`}>Editar</Link>
              <button aria-label={`Eliminar ${category.name}`} onClick={() => void requestDelete(category)} type="button">Eliminar</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      </div>
      <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Eliminar" message={`¿Eliminar ${deleting?.name ?? 'esta categoría'}?`} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} open={deleting !== null} title="Eliminar categoría" />
    </section>
  )
}
