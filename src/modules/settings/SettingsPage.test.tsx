// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import { SettingsPage } from './SettingsPage'

function renderPage(gateway = new LocalStateGateway(new MemoryStorage())) {
  render(<MemoryRouter><RepositoryProvider gateway={gateway}><SettingsPage /></RepositoryProvider></MemoryRouter>)
  return gateway
}

describe('SettingsPage', () => {
  afterEach(cleanup)

  it('reads complete defaults, saves ARS with no financial records, and reloads the persisted values', async () => {
    const gateway = renderPage()

    expect((await screen.findByLabelText('Currency') as HTMLSelectElement).value).toBe('USD')
    expect((screen.getByLabelText('Due alert days') as HTMLInputElement).value).toBe('7')
    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ARS' } })
    fireEvent.change(screen.getByLabelText('Due alert days'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Settings saved.'))
    expect(gateway.read().settings).toMatchObject({ currency: 'ARS', dueAlertDays: 10 })
    cleanup()
    renderPage(gateway)
    expect((await screen.findByLabelText('Currency') as HTMLSelectElement).value).toBe('ARS')
    expect((screen.getByLabelText('Due alert days') as HTMLInputElement).value).toBe('10')
  })

  it('rejects an invoice-locked currency change without mutating the current settings', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const state = gateway.read()
    state.dailyIncomes.splice(0)
    await gateway.write(state)
    renderPage(gateway)

    await screen.findByLabelText('Currency')
    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ARS' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Cannot change currency: 3 invoice(s) exist with USD'))
    expect(gateway.read().settings?.currency).toBe('USD')
  })

  it('rejects a daily-income-locked currency change and allows due alert days with matching currency', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const state = gateway.read()
    state.invoices.splice(0)
    state.invoiceLines.splice(0)
    state.payments.splice(0)
    await gateway.write(state)
    renderPage(gateway)

    await screen.findByLabelText('Currency')
    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ARS' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Cannot change currency: 2 daily income(s) exist with USD'))

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'USD' } })
    fireEvent.change(screen.getByLabelText('Due alert days'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Settings saved.'))
    expect(gateway.read().settings).toMatchObject({ currency: 'USD', dueAlertDays: 10 })
  })
})
