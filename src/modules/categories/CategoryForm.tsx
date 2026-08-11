import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Category } from '../../types/domain'
import { useCategories } from './useCategories'

interface CategoryFormProps {
  readonly category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const navigate = useNavigate()
  const { create, update } = useCategories()
  const [name, setName] = useState(category?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Category name is required')
      return
    }
    setError(null)
    try {
      if (category) await update(category.id, { name: trimmedName })
      else await create({ name: trimmedName })
      navigate('/categories')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save category')
    }
  }

  return (
    <section aria-labelledby="category-form-title" className="category-form">
      <p className="eyebrow">Catalog</p>
      <h1 id="category-form-title">{category ? 'Edit category' : 'Create category'}</h1>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="category-name">Category name</label>
      <input id="category-name" name="category-name" onChange={(event) => setName(event.target.value)} value={name} />
      <div className="category-form__actions">
        <button onClick={() => void save()} type="button">Save category</button>
        <button onClick={() => navigate('/categories')} type="button">Cancel</button>
      </div>
    </section>
  )
}
