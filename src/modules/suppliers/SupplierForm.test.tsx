// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import type { Supplier } from '../../types/domain'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { SupplierForm } from './SupplierForm'

const alpha = { id: 'alpha', name: 'Alpha', normalizedName: 'alpha', defaultDueDays: null, deletedAt: null, createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Supplier

function renderForm(suppliers: Record<string, unknown>, supplier?: Supplier) {
  return render(<MemoryRouter><RepositoryProvider repositories={{ suppliers } as never}><SupplierForm supplier={supplier} /></RepositoryProvider></MemoryRouter>)
}

describe('SupplierForm', () => {
  afterEach(cleanup)

  it('creates a trimmed supplier and navigates back to the list', async () => {
    const create = vi.fn(async () => alpha)
    renderForm({ create }, undefined)
    fireEvent.change(screen.getByLabelText('Supplier name'), { target: { value: '  Alpha  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save supplier' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: 'Alpha', defaultDueDays: null }))
  })

  it('rejects empty names and surfaces duplicate repository errors', async () => {
    const create = vi.fn(async () => { throw new Error('duplicate supplier name') })
    renderForm({ create }, undefined)
    fireEvent.click(screen.getByRole('button', { name: 'Save supplier' }))
    expect(screen.getByRole('alert').textContent).toBe('Supplier name is required')

    fireEvent.change(screen.getByLabelText('Supplier name'), { target: { value: 'Alpha' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save supplier' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('duplicate supplier name'))
  })

  it('updates an existing supplier and only soft-deletes after confirmation', async () => {
    const update = vi.fn(async () => ({ ...alpha, name: 'Gamma' }))
    const softDelete = vi.fn(async () => undefined)
    renderForm({ update, softDelete }, alpha)
    fireEvent.change(screen.getByLabelText('Supplier name'), { target: { value: 'Gamma' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save supplier' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith('alpha', { name: 'Gamma', defaultDueDays: null }))

    fireEvent.click(screen.getByRole('button', { name: 'Delete supplier' }))
    expect(softDelete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(softDelete).toHaveBeenCalledWith('alpha'))
  })

  it('rejects editing a supplier to an existing normalized name without mutating stored data', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const [editable, existing] = gateway.read().suppliers
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><SupplierForm supplier={editable} /></RepositoryProvider></MemoryRouter>)

    fireEvent.change(screen.getByLabelText('Supplier name'), { target: { value: `  ${existing.name.toLowerCase()}  ` } })
    fireEvent.click(screen.getByRole('button', { name: 'Save supplier' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('duplicate supplier name'))
    expect((screen.getByLabelText('Supplier name') as HTMLInputElement).value).toBe(`  ${existing.name.toLowerCase()}  `)
    expect(gateway.read().suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name, normalizedName: supplier.normalizedName, deletedAt: supplier.deletedAt }))).toEqual([
      { id: editable.id, name: editable.name, normalizedName: editable.normalizedName, deletedAt: null },
      { id: existing.id, name: existing.name, normalizedName: existing.normalizedName, deletedAt: null },
    ])
  })

  it('keeps a supplier active when deletion is cancelled', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const [editable] = gateway.read().suppliers
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><SupplierForm supplier={editable} /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Delete supplier' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(gateway.read().suppliers.find((supplier) => supplier.id === editable.id)?.deletedAt).toBeNull()
  })
})
