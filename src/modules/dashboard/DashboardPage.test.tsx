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
    expect(await screen.findByText('Period income: 55000')).not.toBeNull()
    expect(screen.getByText('Paid expenses: 15000')).not.toBeNull()
    expect(screen.getByText('Estimated cash result — not net profit: 40000')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'DEMO-300' }).getAttribute('href')).toBe('/invoices/demo-invoice-paid')
    expect(screen.getByText('Demo Category C: 10000')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Due-date alerts' })).not.toBeNull()
  })

  it('changes only period metrics and refreshes after a provider-backed income mutation', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    renderPage(gateway, true)
    await screen.findByText('Period income: 55000')
    fireEvent.click(screen.getByRole('button', { name: 'Day' }))
    expect(await screen.findByText('Period income: 0')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Add today income' }))
    await waitFor(() => expect(screen.getByText('Period income: 70')).not.toBeNull())
  })

  it('renders accessible zero and empty states plus the documented inactivity alert', async () => {
    renderPage()
    expect(await screen.findByText('Period income: 0')).not.toBeNull()
    expect(screen.getByRole('alert').textContent).toContain('No daily income recorded in the last 7 days')
    expect(screen.getByText('No invoices yet')).not.toBeNull()
    expect(screen.getByText('No paid-expense categories for this period')).not.toBeNull()
    expect(screen.getByText('Load seed data to explore the dashboard.')).not.toBeNull()
    expect(screen.getByRole('group', { name: 'Dashboard period' })).not.toBeNull()
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
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load dashboard')
    fireEvent.click(screen.getByRole('button', { name: 'Retry dashboard' }))
    expect(await screen.findByText('Period income: 0')).not.toBeNull()
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
    expect(await screen.findByText('Paid expenses: 15000')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Register real payment' }))
    await waitFor(() => expect(screen.getByText('Paid expenses: 25000')).not.toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Void real payment' }))
    await waitFor(() => expect(screen.getByText('Paid expenses: 15000')).not.toBeNull())
  })
})
