// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import type { Supplier } from '../../types/domain'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { SupplierPage } from './SupplierPage'

const active = { id: 'active', name: 'Active supplier', normalizedName: 'active supplier', defaultDueDays: null, deletedAt: null, createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Supplier
const deleted = { ...active, id: 'deleted', name: 'Deleted supplier', deletedAt: '2026-08-11T00:00:00.000Z' as never }

function Location() {
  return <output aria-label="location">{useLocation().pathname}</output>
}

describe('SupplierPage', () => {
  afterEach(cleanup)

  it('lists active suppliers only and links each supplier to its edit form', async () => {
    const repositories = { suppliers: { findAll: async () => [active, deleted] } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('link', { name: 'Editar Active supplier' }).getAttribute('href')).toBe('/suppliers/active/edit'))
    expect(screen.queryByText(deleted.name)).toBeNull()
  })

  it('shows a create action when no active suppliers exist', async () => {
    const repositories = { suppliers: { findAll: async () => [] } }
    render(<MemoryRouter><Location /><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear proveedor' }).textContent).toBe('Crear proveedor'))
    fireEvent.click(screen.getByRole('button', { name: 'Crear proveedor' }))
    expect(screen.getByRole('status', { name: 'location' }).textContent).toBe('/suppliers/new')
  })

  it('shows a truthful error when confirmed deletion fails', async () => {
    const softDelete = vi.fn(async () => { throw new Error('Storage unavailable') })
    const repositories = { suppliers: { findAll: async () => [active], softDelete } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await screen.findByRole('button', { name: 'Eliminar Active supplier' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Active supplier' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Storage unavailable'))
    expect(softDelete).toHaveBeenCalledWith('active')
  })

  it('uses fallback errors and lets the user retry an unavailable supplier list', async () => {
    const findAll = vi.fn().mockRejectedValueOnce('offline').mockResolvedValueOnce([active])
    const repositories = { suppliers: { findAll } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await screen.findByText('Could not load suppliers')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await screen.findByRole('button', { name: 'Eliminar Active supplier' })
    expect(findAll).toHaveBeenCalledTimes(2)
  })

  it('keeps the supplier visible when page deletion is cancelled', async () => {
    const repositories = { suppliers: { findAll: async () => [active] } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Active supplier' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Active supplier').textContent).toBe('Active supplier')
  })

  it('uses the fallback error when supplier deletion rejects with a non-Error value', async () => {
    const repositories = { suppliers: { findAll: async () => [active], softDelete: async () => { throw 'offline' } } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Active supplier' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await screen.findByText('No pudimos eliminar el proveedor')
  })

  it('removes a confirmed deletion from the active list after the provider publishes a revision', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><SupplierPage /></RepositoryProvider></MemoryRouter>)

    await screen.findByRole('button', { name: 'Eliminar Laboratorio VetSalud' })
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Laboratorio VetSalud' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(screen.queryByText('Laboratorio VetSalud')).toBeNull())
    expect(screen.getByText('Distribuidora Huellitas').textContent).toBe('Distribuidora Huellitas')
    expect(gateway.read().suppliers.find((supplier) => supplier.id === 'demo-supplier-a')?.deletedAt).not.toBeNull()
  })
})
