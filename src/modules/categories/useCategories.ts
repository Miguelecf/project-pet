import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '../../app/useRepositories'
import type { Category, CategoryId } from '../../types/domain'
import type { CreateCategoryInput, UpdateCategoryInput } from './CategoryRepository'

export function useCategories() {
  const { repositories, revision } = useRepositories()
  const [categories, setCategories] = useState<readonly Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCategories(await repositories.categories.findAll())
    } catch (reason) {
      setCategories([])
      setError(reason instanceof Error ? reason.message : 'Could not load categories')
    } finally {
      setLoading(false)
    }
  }, [repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  const create = useCallback((input: CreateCategoryInput) => repositories.categories.create(input), [repositories])
  const update = useCallback((id: CategoryId, input: UpdateCategoryInput) => repositories.categories.update(id, input), [repositories])
  const remove = useCallback((id: CategoryId) => repositories.categories.delete(id), [repositories])
  const isReferenced = useCallback((id: CategoryId) => repositories.categories.isReferenced(id), [repositories])

  return { categories, loading, error, refresh, create, update, remove, isReferenced }
}
