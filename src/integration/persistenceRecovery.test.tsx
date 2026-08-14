// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../app/RepositoryProvider'
import { LocalDailyIncomeRepository } from '../infrastructure/local/LocalDailyIncomeRepository'
import { LocalStateGateway, STORAGE_KEY } from '../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../infrastructure/local/LocalRepositoryTestFixtures'
import { DashboardPage } from '../modules/dashboard/DashboardPage'

const clock = { today: () => '2026-08-10' as never }

describe('persistence recovery integration', () => {
  afterEach(cleanup)

  it.each(['{not json', JSON.stringify({ schemaVersion: 1, suppliers: [] })])('degrades %j to the dashboard empty recovery prompt without a crash', async (persisted) => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, persisted)
    const gateway = new LocalStateGateway(storage)

    render(<MemoryRouter><RepositoryProvider gateway={gateway}><DashboardPage clock={clock} /></RepositoryProvider></MemoryRouter>)

    expect(await screen.findByText('Cuando cargues una factura, vas a verla acá junto con lo que falta pagar.')).not.toBeNull()
    expect(screen.getByText('Entró a caja: 0')).not.toBeNull()
    expect(gateway.recovery).toBe('needs_seed')
  })

  it('conserves sequential create, edit, and delete mutations in one validated envelope', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const incomes = new LocalDailyIncomeRepository(gateway, { now: () => '2026-08-10T00:00:00.000Z' as never, nextId: () => 'income-q3' as never })

    const created = await incomes.create({ saleDate: '2026-08-11' as never, amountMinor: 25000 as never, note: 'Created' })
    const updated = await incomes.update(created.id, { saleDate: '2026-08-11' as never, amountMinor: 30000 as never, note: 'Edited' })
    await incomes.delete(created.id)

    expect(created).toEqual(expect.objectContaining({ id: 'income-q3', amountMinor: 25000, note: 'Created' }))
    expect(updated).toEqual(expect.objectContaining({ id: 'income-q3', amountMinor: 30000, note: 'Edited', createdAt: '2026-08-10T00:00:00.000Z' }))
    expect(await incomes.findById(created.id)).toBeNull()
    expect(await incomes.findAll()).toHaveLength(15)
    expect(gateway.recovery).toBe('ready')
  })
})
