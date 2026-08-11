// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { LocalStateGateway } from '../../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../../infrastructure/local/LocalRepositoryTestFixtures'
import type { Category } from '../../types/domain'
import { CategoryPage } from './CategoryPage'

const alpha = { id: 'alpha', name: 'Alpha', normalizedName: 'alpha', createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as Category
const beta = { ...alpha, id: 'beta', name: 'Beta', normalizedName: 'beta' } as Category

describe('CategoryPage', () => {
  afterEach(cleanup)

  it('lists every category and links each category to its edit form', async () => {
    const repositories = { categories: { findAll: async () => [alpha, beta] } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('link', { name: 'Edit Alpha' }).getAttribute('href')).toBe('/categories/alpha/edit'))
    expect(screen.getByText('Beta').textContent).toBe('Beta')
  })

  it('shows the New Category action when no categories exist', async () => {
    const repositories = { categories: { findAll: async () => [] } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    await waitFor(() => expect(screen.getByRole('button', { name: 'New Category' }).textContent).toBe('New Category'))
  })

  it('blocks deletion with the exact invoice-line reference count', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const [referenced] = gateway.read().categories
    const state = gateway.read()
    state.invoiceLines.push({ ...state.invoiceLines[0], id: 'second-reference' as never, categoryId: referenced.id })
    await gateway.write(state)
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: `Delete ${referenced.name}` }))

    await waitFor(() => expect(screen.getByText('Cannot delete: referenced by 2 invoice line(s)').textContent).toBe('Cannot delete: referenced by 2 invoice line(s)'))
    expect(gateway.read().categories.some((category) => category.id === referenced.id)).toBe(true)
  })

  it('shows the exact count for one real invoice-line reference', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const referenced = gateway.read().categories[0]
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: `Delete ${referenced.name}` }))

    await waitFor(() => expect(screen.getByText('Cannot delete: referenced by 1 invoice line(s)', { selector: 'p' }).textContent).toBe('Cannot delete: referenced by 1 invoice line(s)'))
    expect(gateway.read().invoiceLines.filter((line) => line.categoryId === referenced.id)).toHaveLength(1)
    expect(gateway.read().categories.some((category) => category.id === referenced.id)).toBe(true)
  })

  it('removes an unreferenced category only after confirmed deletion and provider revision', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const unreferenced = gateway.read().categories.at(-1)!
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: `Delete ${unreferenced.name}` }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByText(unreferenced.name)).toBeNull())
    expect(gateway.read().categories.some((category) => category.id === unreferenced.id)).toBe(false)
  })

  it('keeps a category active when deletion is cancelled', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    const unreferenced = gateway.read().categories.at(-1)!
    render(<MemoryRouter><RepositoryProvider gateway={gateway}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: `Delete ${unreferenced.name}` }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(gateway.read().categories.some((category) => category.id === unreferenced.id)).toBe(true)
    expect(screen.getByText(unreferenced.name).textContent).toBe(unreferenced.name)
  })

  it('shows a reference-check failure without opening a false-success dialog', async () => {
    const isReferenced = async () => { throw new Error('Reference check failed') }
    const repositories = { categories: { findAll: async () => [alpha], isReferenced } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Alpha' }))

    await waitFor(() => expect(screen.getByText('Reference check failed', { selector: 'p' }).textContent).toBe('Reference check failed'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('Alpha')).toBeNull()
  })

  it('shows a confirmed-delete failure without removing the category', async () => {
    const remove = async () => { throw new Error('Delete failed') }
    const repositories = { categories: { findAll: async () => [alpha], isReferenced: async () => 0, delete: remove } }
    render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><CategoryPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Delete Alpha' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.getByText('Delete failed', { selector: 'p' }).textContent).toBe('Delete failed'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('Alpha')).toBeNull()
  })
})
