// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Supplier } from '../../types/domain'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { useRepositories } from '../../app/useRepositories'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import { useSuppliers } from './useSuppliers'

const alpha = { id: 'alpha', name: 'Alpha', normalizedName: 'alpha', defaultDueDays: null, deletedAt: null, createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Supplier

function SupplierState() {
  const { error, loading, refresh, suppliers } = useSuppliers()
  return <><p>{loading ? 'loading' : error ?? suppliers.map((supplier) => supplier.name).join(',')}</p><button onClick={() => void refresh()} type="button">Retry supplier load</button></>
}

function RevisionState() {
  const { suppliers } = useSuppliers()
  const { restore } = useRepositories()
  return <><p>{suppliers.map((supplier) => supplier.name).join(',')}</p><button onClick={() => void restore()} type="button">Restore suppliers</button></>
}

describe('useSuppliers', () => {
  afterEach(cleanup)

  it('exposes loading then supplier data from the repository', async () => {
    const repositories = { suppliers: { findAll: async () => [alpha] } }
    render(<RepositoryProvider repositories={repositories as never}><SupplierState /></RepositoryProvider>)

    expect(screen.getByText('loading')).toBeDefined()
    await waitFor(() => expect(screen.getByText('Alpha')).toBeDefined())
  })

  it('exposes a truthful repository error instead of stale data', async () => {
    const findAll = vi.fn().mockRejectedValueOnce(new Error('Storage unavailable')).mockResolvedValueOnce([alpha])
    const repositories = { suppliers: { findAll } }
    render(<RepositoryProvider repositories={repositories as never}><SupplierState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Storage unavailable')).toBeDefined())
    fireEvent.click(screen.getByRole('button', { name: 'Retry supplier load' }))
    await waitFor(() => expect(screen.getByText('Alpha')).toBeDefined())
    expect(findAll).toHaveBeenCalledTimes(2)
  })

  it('uses the catalog fallback message when a non-Error load failure occurs', async () => {
    const repositories = { suppliers: { findAll: async () => { throw 'offline' } } }
    render(<RepositoryProvider repositories={repositories as never}><SupplierState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Could not load suppliers')).toBeDefined())
  })

  it('refetches supplier data after a provider revision is published', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    render(<RepositoryProvider gateway={gateway}><RevisionState /></RepositoryProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Restore suppliers' }))

    await waitFor(() => expect(screen.getByText('Demo Supplier A,Demo Supplier B')).toBeDefined())
  })
})
