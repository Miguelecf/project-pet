// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { useRepositories } from '../../app/useRepositories'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import type { Category } from '../../types/domain'
import { useCategories } from './useCategories'

const alpha = { id: 'alpha', name: 'Alpha', normalizedName: 'alpha', createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Category

function CategoryState() {
  const { categories, error, loading, refresh } = useCategories()
  return <><p>{loading ? 'loading' : error ?? categories.map((category) => category.name).join(',')}</p><button onClick={() => void refresh()} type="button">Retry category load</button></>
}

function RevisionState() {
  const { categories } = useCategories()
  const { restore } = useRepositories()
  return <><p>{categories.map((category) => category.name).join(',')}</p><button onClick={() => void restore()} type="button">Restore categories</button></>
}

describe('useCategories', () => {
  afterEach(cleanup)

  it('exposes loading then category data from the repository', async () => {
    const repositories = { categories: { findAll: async () => [alpha] } }
    render(<RepositoryProvider repositories={repositories as never}><CategoryState /></RepositoryProvider>)

    expect(screen.getByText('loading').textContent).toBe('loading')
    await waitFor(() => expect(screen.getByText('Alpha').textContent).toBe('Alpha'))
  })

  it('exposes a truthful repository error and recovers through retry', async () => {
    const findAll = vi.fn().mockRejectedValueOnce(new Error('Storage unavailable')).mockResolvedValueOnce([alpha])
    const repositories = { categories: { findAll } }
    render(<RepositoryProvider repositories={repositories as never}><CategoryState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Storage unavailable').textContent).toBe('Storage unavailable'))
    fireEvent.click(screen.getByRole('button', { name: 'Retry category load' }))
    await waitFor(() => expect(screen.getByText('Alpha').textContent).toBe('Alpha'))
    expect(findAll).toHaveBeenCalledTimes(2)
  })

  it('refetches category data after a provider restore publishes a revision', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    render(<RepositoryProvider gateway={gateway}><RevisionState /></RepositoryProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Restore categories' }))

    await waitFor(() => expect(screen.getByText('Demo Category A,Demo Category B,Demo Category C,Demo Category D,Demo Category E,Demo Category F').textContent).toBe('Demo Category A,Demo Category B,Demo Category C,Demo Category D,Demo Category E,Demo Category F'))
  })
})
