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
      setMutationError(reason instanceof Error ? reason.message : 'No pudimos eliminar el ingreso diario')
    }
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Lista de ingresos diarios" /></StateOverlay>
  const error = mutationError ?? loadError
  if (error) return <StateOverlay error={error} onRetry={() => { setMutationError(null); void refresh() }} state="error"><section aria-label="Lista de ingresos diarios" /></StateOverlay>
  if (incomes.length === 0) return <StateOverlay emptyActionLabel="Crear ingreso diario" emptyMessage="Todavía no hay ingresos diarios." onEmptyAction={() => navigate('/daily-income/new')} state="empty"><section aria-label="Lista de ingresos diarios" /></StateOverlay>

  return <section aria-labelledby="daily-income-title" className="daily-income-page">
    <p className="eyebrow">Operación</p>
    <h1 id="daily-income-title">Ingresos diarios</h1>
    <Link className="primary-action" to="/daily-income/new">Crear ingreso diario</Link>
    <div className="data-table-wrap">
      <table aria-label="Ingresos diarios" className="data-table data-table--daily-income">
        <thead><tr><th scope="col">Fecha</th><th scope="col">Monto</th><th scope="col">Moneda</th><th scope="col">Nota</th><th scope="col">Acciones</th></tr></thead>
        <tbody>
          {incomes.map((income) => <tr key={income.id}>
            <th scope="row">{income.saleDate}</th>
            <td className="data-table__amount">{income.amountMinor}</td>
            <td>{income.currency}</td>
            <td>{income.note ?? 'Sin nota'}</td>
            <td>
              <Link aria-label={`Editar ingreso del ${income.saleDate}`} to={`/daily-income/${income.id}/edit`}>Editar</Link>
              <button aria-label={`Eliminar ingreso del ${income.saleDate}`} onClick={() => setDeleting(income)} type="button">Eliminar</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Eliminar" message={`¿Eliminar el ingreso del ${deleting?.saleDate ?? 'día seleccionado'}?`} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} open={deleting !== null} title="Eliminar ingreso diario" />
  </section>
}
