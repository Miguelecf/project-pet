// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { DueAlerts } from './DueAlerts'

const clock = { today: () => '2026-08-10' as never }

function renderAlerts(invoices: readonly unknown[], dueAlertDays = 7, payments: Record<string, readonly unknown[]> = {}) {
  return render(
    <MemoryRouter>
      <RepositoryProvider repositories={{
        invoices: { findAll: async () => invoices },
        payments: { findByInvoice: async (id: string) => payments[id] ?? [] },
        settings: { get: async () => ({ dueAlertDays }) },
      } as never}>
        <DueAlerts clock={clock} />
        <Location />
      </RepositoryProvider>
    </MemoryRouter>,
  )
}

function Location() {
  return <output aria-label="location">{useLocation().pathname}</output>
}

describe('DueAlerts', () => {
  afterEach(cleanup)

  it('lists overdue and due-soon active balances, including the exact configured boundary', async () => {
    renderAlerts([
      { id: 'overdue', docRef: 'INV-OVERDUE', dueDate: '2026-08-08', totalMinor: 1000, deletedAt: null },
      { id: 'soon', docRef: 'INV-SOON', dueDate: '2026-08-13', totalMinor: 2000, deletedAt: null },
      { id: 'boundary', docRef: 'INV-BOUNDARY', dueDate: '2026-08-17', totalMinor: 3000, deletedAt: null },
    ])

    expect(await screen.findByRole('link', { name: /INV-OVERDUE/ })).not.toBeNull()
    expect(screen.getByLabelText('Vencida')).not.toBeNull()
    expect(screen.getAllByLabelText('Vence pronto')).toHaveLength(2)
    expect(screen.getAllByText('Vence pronto')).toHaveLength(2)
    expect(screen.getByText('Vence el 2026-08-17')).not.toBeNull()
    expect(screen.getByText('Falta pagar 3000')).not.toBeNull()
  })

  it('excludes paid, deleted, undated, and later invoices and announces a clear no-alert state', async () => {
    renderAlerts([
      { id: 'paid', docRef: 'INV-PAID', dueDate: '2026-08-08', totalMinor: 1000, deletedAt: null },
      { id: 'deleted', docRef: 'INV-DELETED', dueDate: '2026-08-08', totalMinor: 1000, deletedAt: '2026-08-10T00:00:00.000Z' },
      { id: 'undated', docRef: 'INV-UNDATED', dueDate: null, totalMinor: 1000, deletedAt: null },
      { id: 'later', docRef: 'INV-LATER', dueDate: '2026-08-18', totalMinor: 1000, deletedAt: null },
    ], 7, { paid: [{ amountMinor: 1000, isVoid: false }] })

    expect(await screen.findByText('No tenés facturas vencidas ni próximas a vencer.')).not.toBeNull()
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.queryByText('INV-PAID')).toBeNull()
    expect(screen.queryByText('INV-DELETED')).toBeNull()
    expect(screen.queryByText('INV-UNDATED')).toBeNull()
    expect(screen.queryByText('INV-LATER')).toBeNull()
  })

  it('uses semantic list entries and client-side invoice-detail navigation', async () => {
    renderAlerts([{ id: 'soon', docRef: 'INV-SOON', dueDate: '2026-08-13', totalMinor: 2000, deletedAt: null }])

    const alertLink = await screen.findByRole('link', { name: /INV-SOON/ })
    expect(alertLink.getAttribute('href')).toBe('/invoices/soon')
    expect(screen.getByRole('list').querySelectorAll('li')).toHaveLength(1)
    expect(screen.getByLabelText('Vence pronto')).not.toBeNull()
    fireEvent.click(alertLink)
    expect(screen.getByLabelText('location').textContent).toBe('/invoices/soon')
  })
})
