import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RestoreDemoData } from '../../app/RestoreDemoData'
import { useRepositories } from '../../app/useRepositories'
import type { Clock } from '../../utils/dates'
import { DueAlerts } from './DueAlerts'
import { aggregateDashboard, type DashboardPeriod } from './dashboardAggregates'

const periodLabels: Record<DashboardPeriod, string> = { day: 'Día', week: 'Semana', month: 'Mes' }
const invoiceStatusLabels = { pending: 'Pendiente', partially_paid: 'Pago parcial', paid: 'Pagada' } as const

export function DashboardPage({ clock }: { readonly clock: Clock }) {
  const { repositories, revision } = useRepositories()
  const [period, setPeriod] = useState<DashboardPeriod>('month')
  const [state, setState] = useState<ReturnType<typeof aggregateDashboard> | null>(null)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  const refresh = useCallback(async () => {
    try {
      setError(false)
      const [invoices, incomes, categories] = await Promise.all([
        repositories.invoices.findAll(),
        repositories.dailyIncomes.findAll(),
        repositories.categories.findAll(),
      ])
      const records = await Promise.all(invoices.map(async (invoice) => {
        const [detail, payments] = await Promise.all([
          repositories.invoices.findById(invoice.id),
          repositories.payments.findByInvoice(invoice.id),
        ])
        return { lines: detail?.lines ?? [], payments }
      }))
      setState(aggregateDashboard({
        today: clock.today(), period, invoices, incomes, categories,
        lines: records.flatMap((record) => record.lines),
        payments: records.flatMap((record) => record.payments),
      }))
    } catch {
      setError(true)
    }
  }, [clock, period, repositories])

  useEffect(() => { void refresh() }, [refresh, revision, reload])

  if (error) return <section className="dashboard-state dashboard-state--error"><p className="eyebrow">Control diario</p><h1>Resumen del negocio</h1><p role="alert">No pudimos cargar el resumen. Probá de nuevo.</p><button className="dashboard-button dashboard-button--primary" onClick={() => setReload((value) => value + 1)}>Volver a intentar</button></section>
  if (!state) return <section aria-busy="true" className="dashboard-state"><p className="eyebrow">Control diario</p><h1>Resumen del negocio</h1><p>Cargando los movimientos…</p></section>

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Control diario</p>
          <h1>Así está tu negocio</h1>
          <p className="dashboard-header__summary">Mirá de un vistazo lo que entró, lo que pagaste y lo que todavía tenés pendiente.</p>
        </div>
        <div className="dashboard-header__controls">
          <fieldset className="period-control">
            <legend>Período a consultar</legend>
            <div>
              {(['day', 'week', 'month'] as const).map((value) => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{periodLabels[value]}</button>)}
            </div>
          </fieldset>
          <button className="dashboard-button" onClick={() => setReload((value) => value + 1)}>Actualizar datos</button>
        </div>
      </div>

      <section aria-labelledby="financial-overview-title" className="financial-overview">
        <div className="section-heading"><div><p className="section-label">Panorama del período</p><h2 id="financial-overview-title">Lo importante ahora</h2></div><p>Del {state.range.start} al {state.range.end}</p></div>
        <dl className="metric-grid">
          <div className="metric-card metric-card--income"><dt>Entró a caja</dt><dd>{state.metrics.incomeMinor}</dd><span className="sr-only">Entró a caja: {state.metrics.incomeMinor}</span></div>
          <div className="metric-card"><dt>Pagaste</dt><dd>{state.metrics.paidExpensesMinor}</dd><span className="sr-only">Pagaste: {state.metrics.paidExpensesMinor}</span></div>
          <div className="metric-card metric-card--cash"><dt>Resultado de caja</dt><dd>{state.metrics.estimatedCashResultMinor}</dd><p>Es una estimación, no una ganancia final.</p><span className="sr-only">Resultado de caja: {state.metrics.estimatedCashResultMinor}</span></div>
          <div className="metric-card metric-card--outstanding"><dt>Te falta pagar</dt><dd>{state.metrics.outstandingMinor}</dd><span className="sr-only">Te falta pagar: {state.metrics.outstandingMinor}</span></div>
        </dl>
        <div className="invoice-status-summary" aria-label={`Estado de facturas: Pendientes ${state.statusCounts.pending}, Con pago parcial ${state.statusCounts.partially_paid}, Pagadas ${state.statusCounts.paid}`}>
          <p>Estado de facturas</p><dl><div><dt>Pendientes</dt><dd>{state.statusCounts.pending}</dd></div><div><dt>Con pago parcial</dt><dd>{state.statusCounts.partially_paid}</dd></div><div><dt>Pagadas</dt><dd>{state.statusCounts.paid}</dd></div></dl>
        </div>
      </section>

      {state.inactive && <p className="dashboard-notice" role="alert">No registraste ingresos en los últimos 7 días. Revisá si te falta cargar algún cierre de caja.</p>}

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel--week" aria-labelledby="weekly-income-title"><div className="section-heading"><div><p className="section-label">Movimiento</p><h2 id="weekly-income-title">Ingresos de esta semana</h2></div></div><ul className="weekly-income-list" aria-label="Ingresos de esta semana">{state.weeklyIncome.map((day) => <li key={day.date}><span>{day.date}</span><strong>{day.amountMinor}</strong></li>)}</ul></section>
        <DueAlerts clock={clock} />
        <section className="dashboard-panel dashboard-panel--invoices" aria-labelledby="latest-invoices-title"><div className="section-heading"><div><p className="section-label">Compras</p><h2 id="latest-invoices-title">Últimas facturas</h2></div></div>{state.latestInvoices.length ? <ul className="invoice-list" aria-label="Últimas facturas">{state.latestInvoices.map(({ invoice, status, outstandingMinor }) => <li key={invoice.id}><div><Link to={`/invoices/${invoice.id}`}>{invoice.docRef ?? 'Factura'}</Link><span>{invoice.issueDate}</span></div><div><span className={`invoice-status invoice-status--${status}`}>{invoiceStatusLabels[status]}</span><strong>{invoice.totalMinor}</strong><span>Falta pagar {outstandingMinor}</span></div></li>)}</ul> : <p className="empty-panel">Todavía no cargaste facturas.</p>}</section>
        <section className="dashboard-panel dashboard-panel--categories" aria-labelledby="category-breakdown-title"><div className="section-heading"><div><p className="section-label">Gastos</p><h2 id="category-breakdown-title">En qué gastaste</h2></div></div>{state.categoryBreakdown.length ? <ul className="category-list" aria-label="Gastos por categoría">{state.categoryBreakdown.map((category) => <li key={category.categoryId}><span>{category.name}</span><strong>{category.amountMinor}</strong></li>)}</ul> : <p className="empty-panel">Todavía no hay gastos pagados en este período.</p>}</section>
      </div>
      {state.latestInvoices.length === 0 && <p className="dashboard-empty-prompt">Cuando cargues una factura, vas a verla acá junto con lo que falta pagar.</p>}
      <aside className="dashboard-recovery"><p>Datos de ejemplo</p><RestoreDemoData /></aside>
    </div>
  )
}
