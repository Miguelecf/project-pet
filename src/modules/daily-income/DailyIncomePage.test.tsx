// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import { DailyIncomePage } from './DailyIncomePage'

describe('DailyIncomePage', () => {
  afterEach(cleanup)

  it('lists persisted records newest first and shows their snapshot details', async () => {
    const incomes = [
      { id: 'older', saleDate: '2026-08-09', amountMinor: 100, currency: 'USD', note: null },
      { id: 'newer', saleDate: '2026-08-10', amountMinor: 200, currency: 'ARS', note: 'Counter sale' },
    ]
    render(<MemoryRouter><RepositoryProvider repositories={{ dailyIncomes: { findAll: async () => incomes } } as never}><DailyIncomePage /></RepositoryProvider></MemoryRouter>)

    const list = await screen.findByRole('list', { name: 'Ingresos diarios' })
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['2026-08-10 — 200 ARS — Counter saleEditarEliminar', '2026-08-09 — 100 USD — Sin notaEditarEliminar'])
  })

  it('shows an accessible empty action when no records exist', async () => {
    render(<MemoryRouter><RepositoryProvider repositories={{ dailyIncomes: { findAll: async () => [] } } as never}><DailyIncomePage /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByRole('button', { name: 'Crear ingreso diario' })).textContent).toBe('Crear ingreso diario')
  })

  it('only deletes after confirmation and preserves the record when cancelled', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><DailyIncomePage /></RepositoryProvider></MemoryRouter>)
    const income = gateway.read().dailyIncomes[0]

    fireEvent.click(await screen.findByRole('button', { name: `Eliminar ingreso del ${income.saleDate}` }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(gateway.read().dailyIncomes.find((item) => item.id === income.id)).toEqual(income)
    fireEvent.click(screen.getByRole('button', { name: `Eliminar ingreso del ${income.saleDate}` }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(gateway.read().dailyIncomes.find((item) => item.id === income.id)).toBeUndefined())
  })
})
