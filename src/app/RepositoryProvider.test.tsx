// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../infrastructure/local/LocalRepositoryTestFixtures'
import { RepositoryProvider } from './RepositoryProvider'
import { useRepositories } from './useRepositories'

function RepositoryConsumer() {
  const { repositories, restore, revision } = useRepositories()

  return (
    <>
      <output>{revision}</output>
      <button onClick={() => void repositories.suppliers.create({ name: 'Created supplier', defaultDueDays: null })} type="button">Create</button>
      <button onClick={() => void repositories.suppliers.create({ name: 'created supplier', defaultDueDays: null }).catch(() => undefined)} type="button">Create duplicate</button>
      <button onClick={() => void restore()} type="button">Restore</button>
    </>
  )
}

describe('RepositoryProvider', () => {
  afterEach(cleanup)

  it('provides real local repositories and increments revision only after a successful mutation', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    render(<RepositoryProvider gateway={gateway}><RepositoryConsumer /></RepositoryProvider>)

    expect(screen.getByRole('status').textContent).toBe('0')
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('1'))
    await expect(gateway.read().suppliers.map((supplier) => supplier.name)).toEqual(['Created supplier'])
    fireEvent.click(screen.getByRole('button', { name: 'Create duplicate' }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(screen.getByRole('status').textContent).toBe('1')
  })

  it('restores deterministic data and publishes a revision so consumers refetch', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    render(<RepositoryProvider gateway={gateway}><RepositoryConsumer /></RepositoryProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('1'))
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }))

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('2'))
    await expect(gateway.read().suppliers.slice(0, 2).map((supplier) => supplier.name)).toEqual(['Laboratorio VetSalud', 'Distribuidora Huellitas'])
  })
})
