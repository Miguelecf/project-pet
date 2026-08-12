import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '../../app/useRepositories'
import type { DailyIncome, DailyIncomeId } from '../../types/domain'
import type { CreateDailyIncomeInput, UpdateDailyIncomeInput } from './DailyIncomeRepository'

export function useDailyIncomes() {
  const { repositories, revision } = useRepositories()
  const [incomes, setIncomes] = useState<readonly DailyIncome[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setIncomes((await repositories.dailyIncomes.findAll()).toSorted((a, b) => b.saleDate.localeCompare(a.saleDate)))
    } catch (reason) {
      setIncomes([])
      setError(reason instanceof Error ? reason.message : 'Could not load daily incomes')
    } finally {
      setLoading(false)
    }
  }, [repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  const create = useCallback((input: CreateDailyIncomeInput) => repositories.dailyIncomes.create(input), [repositories])
  const update = useCallback((id: DailyIncomeId, input: UpdateDailyIncomeInput) => repositories.dailyIncomes.update(id, input), [repositories])
  const remove = useCallback((id: DailyIncomeId) => repositories.dailyIncomes.delete(id), [repositories])

  return { incomes, loading, error, refresh, create, update, remove }
}
