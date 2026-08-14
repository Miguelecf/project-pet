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
      setError('El nombre de la categoría es obligatorio')
      return
    }
    setError(null)
    try {
      if (category) await update(category.id, { name: trimmedName })
      else await create({ name: trimmedName })
      navigate('/categories')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar la categoría')
    }
  }

  return (
    <section aria-labelledby="category-form-title" className="category-form">
      <p className="eyebrow">Catálogo</p>
      <h1 id="category-form-title">{category ? 'Editar categoría' : 'Crear categoría'}</h1>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="category-name">Nombre de la categoría</label>
      <input id="category-name" name="category-name" onChange={(event) => setName(event.target.value)} value={name} />
      <div className="category-form__actions">
        <button onClick={() => void save()} type="button">Guardar</button>
        <button onClick={() => navigate('/categories')} type="button">Cancelar</button>
      </div>
    </section>
  )
}
