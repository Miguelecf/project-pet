// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import type { Category } from '../../types/domain'
import { CategoryForm } from './CategoryForm'

const alpha = { id: 'alpha', name: 'Alpha', normalizedName: 'alpha', createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Category

function renderForm(categories: Record<string, unknown>, category?: Category) {
  return render(<MemoryRouter><RepositoryProvider repositories={{ categories } as never}><CategoryForm category={category} /></RepositoryProvider></MemoryRouter>)
}

describe('CategoryForm', () => {
  afterEach(cleanup)

  it('creates a trimmed category and navigates back to the list', async () => {
    const create = vi.fn(async () => alpha)
    renderForm({ create })
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: '  Alpha  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: 'Alpha' }))
  })

  it('rejects empty names and surfaces duplicate repository errors', async () => {
    const create = vi.fn(async () => { throw new Error('duplicate category name') })
    renderForm({ create })
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }))
    expect(screen.getByRole('alert').textContent).toBe('Category name is required')

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Alpha' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('duplicate category name'))
  })

  it('updates a category with a unique trimmed value', async () => {
    const update = vi.fn(async () => ({ ...alpha, name: 'Gamma' }))
    renderForm({ update }, alpha)
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: '  Gamma  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }))

    await waitFor(() => expect(update).toHaveBeenCalledWith('alpha', { name: 'Gamma' }))
  })

  it('rejects editing to a duplicate normalized name without mutating local state', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const [editable, existing] = gateway.read().categories
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><CategoryForm category={editable} /></RepositoryProvider></MemoryRouter>)

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: `  ${existing.name.toLowerCase()}  ` } })
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('duplicate category name'))
    expect(gateway.read().categories.map((category) => ({ id: category.id, name: category.name, normalizedName: category.normalizedName }))).toEqual([
      { id: editable.id, name: editable.name, normalizedName: editable.normalizedName },
      { id: existing.id, name: existing.name, normalizedName: existing.normalizedName },
      ...gateway.read().categories.slice(2).map((category) => ({ id: category.id, name: category.name, normalizedName: category.normalizedName })),
    ])
  })

  it('uses the fallback save error and exposes cancellation navigation', async () => {
    const create = vi.fn(async () => { throw 'offline' })
    renderForm({ create })
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Alpha' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save category' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Could not save category'))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })
})
