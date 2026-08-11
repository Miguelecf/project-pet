import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '../../app/useRepositories'
import type { Supplier, SupplierId } from '../../types/domain'
import type { CreateSupplierInput, UpdateSupplierInput } from './SupplierRepository'

export function useSuppliers() {
  const { repositories, revision } = useRepositories()
  const [suppliers, setSuppliers] = useState<readonly Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSuppliers(await repositories.suppliers.findAll())
    } catch (reason) {
      setSuppliers([])
      setError(reason instanceof Error ? reason.message : 'Could not load suppliers')
    } finally {
      setLoading(false)
    }
  }, [repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  const create = useCallback((input: CreateSupplierInput) => repositories.suppliers.create(input), [repositories])
  const update = useCallback((id: SupplierId, input: UpdateSupplierInput) => repositories.suppliers.update(id, input), [repositories])
  const softDelete = useCallback((id: SupplierId) => repositories.suppliers.softDelete(id), [repositories])

  return { suppliers, loading, error, refresh, create, update, softDelete }
}
