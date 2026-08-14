// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { useRepositories } from '../../app/useRepositories'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import { DashboardPage } from './DashboardPage'

const clock = { today: () => '2026-08-10' as never }
const metricValue = (label: string) => screen.getByText(label).parentElement?.querySelector('dd')?.textContent
function AddTodayIncome() {
  const { repositories } = useRepositories()
  return <button onClick={() => void repositories.dailyIncomes.create({ saleDate: '2026-08-10' as never, amountMinor: 70 as never, note: null })}>Add today income</button>
}
function MutateInvoiceAndPayments() {
  const { repositories } = useRepositories()
  return <>
    <button onClick={() => void repositories.invoices.softDelete('demo-invoice-pending' as never)}>Delete pending invoice</button>
    <button onClick={() => void repositories.payments.register({ invoiceId: 'demo-invoice-pending' as never, amountMinor: 10000 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })}>Register real payment</button>
    <button onClick={() => void repositories.payments.void('demo-payment-paid' as never, 'Recorded in error')}>Void real payment</button>
  </>
}
const renderPage = (gateway = new LocalStateGateway(new MemoryStorage()), mutation = false) => render(<MemoryRouter><RepositoryProvider gateway={gateway}><DashboardPage clock={clock} />{mutation && <AddTodayIncome />}</RepositoryProvider></MemoryRouter>)

describe('DashboardPage', () => {
  afterEach(cleanup)

  it('renders seeded metrics, disclosure, weekly summary, latest links, category values, and DueAlerts', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    renderPage(gateway, true)
    await screen.findByText('Lo importante ahora')
    expect(metricValue('Entró a caja')).toBe('55000')
    expect(metricValue('Pagaste')).toBe('15000')
    expect(screen.getByText('Resultado de caja')).not.toBeNull()
    expect(screen.getByText('Es una estimación, no una ganancia final.')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'DEMO-300' }).getAttribute('href')).toBe('/invoices/demo-invoice-paid')
    expect(screen.getByText('Demo Category C').parentElement?.textContent).toBe('Demo Category C10000')
    expect(screen.getByRole('heading', { name: 'Vencimientos cercanos' })).not.toBeNull()
  })

  it('changes only period metrics and refreshes after a provider-backed income mutation', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    renderPage(gateway, true)
    await screen.findByText('Lo importante ahora')
    expect(metricValue('Entró a caja')).toBe('55000')
    fireEvent.click(screen.getByRole('button', { name: 'Día' }))
    await screen.findByText('Lo importante ahora')
    expect(metricValue('Entró a caja')).toBe('0')
    fireEvent.click(screen.getByRole('button', { name: 'Add today income' }))
    await waitFor(() => expect(metricValue('Entró a caja')).toBe('70'))
  })

  it('renders accessible zero and empty states plus the documented inactivity alert', async () => {
    renderPage()
    await screen.findByText('Lo importante ahora')
    expect(metricValue('Entró a caja')).toBe('0')
    expect(screen.getByRole('alert').textContent).toContain('No registraste ingresos en los últimos 7 días')
    expect(screen.getByText('Todavía no cargaste facturas.')).not.toBeNull()
    expect(screen.getByText('Todavía no hay gastos pagados en este período.')).not.toBeNull()
    expect(screen.getByText('Cuando cargues una factura, vas a verla acá junto con lo que falta pagar.')).not.toBeNull()
    expect(screen.getByRole('group', { name: 'Período a consultar' })).not.toBeNull()
  })

  it('shows a retryable loading failure and reloads the dashboard', async () => {
    let attempts = 0
    const repositories = {
      invoices: { findAll: async () => { attempts++; if (attempts === 1) throw new Error('offline'); return [] } },
      dailyIncomes: { findAll: async () => [] },
      categories: { findAll: async () => [] },
      payments: { findByInvoice: async () => [] },
      settings: { get: async () => ({ dueAlertDays: 7 }) },
    }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><DashboardPage clock={clock} /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByRole('alert')).textContent).toContain('No pudimos cargar el resumen')
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }))
    await screen.findByText('Lo importante ahora')
    expect(metricValue('Entró a caja')).toBe('0')
  })

  it('rerenders latest invoices after a real provider-backed invoice mutation', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><DashboardPage clock={clock} /><MutateInvoiceAndPayments /></RepositoryProvider></MemoryRouter>)
    expect(await screen.findByRole('link', { name: 'DEMO-100' })).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Delete pending invoice' }))
    await waitFor(() => expect(screen.queryByRole('link', { name: 'DEMO-100' })).toBeNull())
  })

  it('rerenders paid expenses after real payment registration and void mutations', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><DashboardPage clock={clock} /><MutateInvoiceAndPayments /></RepositoryProvider></MemoryRouter>)
    await screen.findByText('Lo importante ahora')
    expect(metricValue('Pagaste')).toBe('15000')
    fireEvent.click(screen.getByRole('button', { name: 'Register real payment' }))
    await waitFor(() => expect(metricValue('Pagaste')).toBe('25000'))
    fireEvent.click(screen.getByRole('button', { name: 'Void real payment' }))
    await waitFor(() => expect(metricValue('Pagaste')).toBe('15000'))
  })
})
