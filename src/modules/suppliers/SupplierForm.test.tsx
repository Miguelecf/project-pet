// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
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
})
