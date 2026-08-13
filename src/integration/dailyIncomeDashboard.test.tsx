// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../app/RepositoryProvider'
import { useRepositories } from '../app/useRepositories'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../infrastructure/local/LocalRepositoryTestFixtures'
import { DashboardPage } from '../modules/dashboard/DashboardPage'

const clock = { today: () => '2026-08-10' as never }

function IncomeMutations() {
  const { repositories } = useRepositories()
  const create = async () => { await repositories.dailyIncomes.create({ saleDate: '2026-08-10' as never, amountMinor: 25000 as never, note: 'Integration sale' }) }
  const edit = async () => { const income = (await repositories.dailyIncomes.findAll()).find((item) => item.saleDate === '2026-08-10')!; await repositories.dailyIncomes.update(income.id, { saleDate: income.saleDate, amountMinor: 30000 as never, note: 'Edited sale' }) }
  const remove = async () => { const income = (await repositories.dailyIncomes.findAll()).find((item) => item.saleDate === '2026-08-10')!; await repositories.dailyIncomes.delete(income.id) }
  return <><button onClick={() => void create()}>Create dashboard income</button><button onClick={() => void edit()}>Edit dashboard income</button><button onClick={() => void remove()}>Delete dashboard income</button></>
}

describe('daily income dashboard integration', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('updates day metrics through the real provider revision after create, edit, and delete', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('income-dashboard-q3') })
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><DashboardPage clock={clock} /><IncomeMutations /></RepositoryProvider></MemoryRouter>)

    await screen.findByText('Period income: 55000')
    screen.getByRole('button', { name: 'Day' }).click()
    await screen.findByText('Period income: 0')
    screen.getByRole('button', { name: 'Create dashboard income' }).click()
    await waitFor(() => expect(screen.getByText('Period income: 25000')).not.toBeNull())
    screen.getByRole('button', { name: 'Edit dashboard income' }).click()
    await waitFor(() => expect(screen.getByText('Period income: 30000')).not.toBeNull())
    screen.getByRole('button', { name: 'Delete dashboard income' }).click()
    await waitFor(() => expect(screen.getByText('Period income: 0')).not.toBeNull())
    expect(gateway.read().dailyIncomes.some((income) => income.id === 'income-dashboard-q3')).toBe(false)
  })
})
