import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '../../app/useRepositories'
import type { Invoice, InvoiceId } from '../../types/domain'
import type { CreateInvoiceInput, UpdateInvoiceInput } from './InvoiceRepository'

export function useInvoices() {
  const { repositories, revision } = useRepositories()
  const [invoices, setInvoices] = useState<readonly Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setInvoices(await repositories.invoices.findAll())
    } catch (reason) {
      setInvoices([])
      setError(reason instanceof Error ? reason.message : 'Could not load invoices')
    } finally {
      setLoading(false)
    }
  }, [repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  const findById = useCallback((id: InvoiceId) => repositories.invoices.findById(id), [repositories])
  const create = useCallback((input: CreateInvoiceInput) => repositories.invoices.create(input), [repositories])
  const update = useCallback((id: InvoiceId, input: UpdateInvoiceInput) => repositories.invoices.update(id, input), [repositories])

  return {
    invoices,
    loading,
    error,
    refresh,
    findById,
    create,
    update,
  }
}
