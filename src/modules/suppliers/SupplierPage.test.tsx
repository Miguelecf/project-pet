// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import type { Supplier } from '../../types/domain'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { SupplierPage } from './SupplierPage'

const active = { id: 'active', name: 'Active supplier', normalizedName: 'active supplier', defaultDueDays: null, deletedAt: null, createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Supplier
const deleted = { ...active, id: 'deleted', name: 'Deleted supplier', deletedAt: '2026-08-11T00:00:00.000Z' as never }

describe('SupplierPage', () => {
  afterEach(cleanup)

  it('lists active suppliers only and links each supplier to its edit form', async () => {
    const repositories = { suppliers: { findAll: async () => [active, deleted] } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('link', { name: 'Edit Active supplier' }).getAttribute('href')).toBe('/suppliers/active/edit'))
    expect(screen.queryByText(deleted.name)).toBeNull()
  })

  it('shows a create action when no active suppliers exist', async () => {
    const repositories = { suppliers: { findAll: async () => [] } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Create Supplier' })).toBeDefined())
  })

  it('shows a truthful error when confirmed deletion fails', async () => {
    const softDelete = vi.fn(async () => { throw new Error('Storage unavailable') })
    const repositories = { suppliers: { findAll: async () => [active], softDelete } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await screen.findByRole('button', { name: 'Delete Active supplier' })
    fireEvent.click(screen.getByRole('button', { name: 'Delete Active supplier' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Storage unavailable'))
    expect(softDelete).toHaveBeenCalledWith('active')
  })
})
