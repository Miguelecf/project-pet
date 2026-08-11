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
        setMutationError(`Cannot delete: referenced by ${references} invoice line(s)`)
        return
      }
      setDeleting(category)
    } catch (reason) {
      setMutationError(reason instanceof Error ? reason.message : 'Could not check category references')
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
      setDeleting(null)
    } catch (reason) {
      setDeleting(null)
      setMutationError(reason instanceof Error ? reason.message : 'Could not delete category')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Category list" /></StateOverlay>
  const error = mutationError ?? loadError
  if (error) return <StateOverlay error={error} onRetry={() => { setMutationError(null); void refresh() }} state="error"><section aria-label="Category list" /></StateOverlay>
  if (categories.length === 0) return <StateOverlay emptyActionLabel="New Category" emptyMessage="No categories yet." onEmptyAction={() => navigate('/categories/new')} state="empty"><section aria-label="Category list" /></StateOverlay>

  return (
    <section aria-labelledby="categories-title" className="category-page">
      <p className="eyebrow">Catalog</p>
      <h1 id="categories-title">Categories</h1>
      <Link className="primary-action" to="/categories/new">New Category</Link>
      <ul aria-label="Categories" className="category-list">
        {categories.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            <div>
              <Link aria-label={`Edit ${category.name}`} to={`/categories/${category.id}/edit`}>Edit</Link>
              <button aria-label={`Delete ${category.name}`} onClick={() => void requestDelete(category)} type="button">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog cancelLabel="Cancel" confirmLabel="Delete" message={`Delete ${deleting?.name ?? 'category'}?`} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} open={deleting !== null} title="Delete category" />
    </section>
  )
}
