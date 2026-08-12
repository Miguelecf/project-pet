import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StateOverlay } from '../../components/StateOverlay'
import type { DailyIncome } from '../../types/domain'
import { useDailyIncomes } from './useDailyIncomes'

export function DailyIncomePage() {
  const navigate = useNavigate()
  const { incomes, error: loadError, loading, refresh, remove } = useDailyIncomes()
  const [deleting, setDeleting] = useState<DailyIncome | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  async function confirmDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
      setDeleting(null)
    } catch (reason) {
      setDeleting(null)
      setMutationError(reason instanceof Error ? reason.message : 'Could not delete daily income')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Daily income list" /></StateOverlay>
  const error = mutationError ?? loadError
  if (error) return <StateOverlay error={error} onRetry={() => { setMutationError(null); void refresh() }} state="error"><section aria-label="Daily income list" /></StateOverlay>
  if (incomes.length === 0) return <StateOverlay emptyActionLabel="Create daily income" emptyMessage="No daily incomes yet." onEmptyAction={() => navigate('/daily-income/new')} state="empty"><section aria-label="Daily income list" /></StateOverlay>

  return <section aria-labelledby="daily-income-title">
    <p className="eyebrow">Operations</p>
    <h1 id="daily-income-title">Daily income</h1>
    <Link className="primary-action" to="/daily-income/new">New daily income</Link>
    <ul aria-label="Daily incomes">
      {incomes.map((income) => <li key={income.id}>
        <span>{income.saleDate} — {income.amountMinor} {income.currency} — {income.note ?? 'No note'}</span>
        <div>
          <Link aria-label={`Edit income ${income.saleDate}`} to={`/daily-income/${income.id}/edit`}>Edit</Link>
          <button aria-label={`Delete income ${income.saleDate}`} onClick={() => setDeleting(income)} type="button">Delete</button>
        </div>
      </li>)}
    </ul>
    <ConfirmDialog cancelLabel="Cancel" confirmLabel="Delete" message={`Delete income for ${deleting?.saleDate ?? 'this date'}?`} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} open={deleting !== null} title="Delete daily income" />
  </section>
}
