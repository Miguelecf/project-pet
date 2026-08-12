// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import type { Category, Supplier } from '../../types/domain'
import type { InvoiceWithLines } from './InvoiceRepository'
import { InvoiceForm } from './InvoiceForm'

const supplier = { id: 'supplier-1', name: 'Acme' } as unknown as Supplier
const category = { id: 'category-1', name: 'Materials' } as unknown as Category
const existing = {
  invoice: { id: 'invoice-1', supplierId: 'supplier-1', docRef: null, issueDate: '2026-08-10', dueDate: null, currency: 'USD', notes: null, totalMinor: 200, status: 'pending', deletedAt: null, createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' },
  lines: [{ id: 'line-1', invoiceId: 'invoice-1', categoryId: 'category-1', productRef: 'BOLT', externalSku: null, description: 'Steel bolt', quantity: 2, unitCostMinor: 100, lineTotalMinor: 200, position: 1, createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' }],
} as unknown as InvoiceWithLines

function renderForm(repositories: Record<string, unknown>, invoice?: InvoiceWithLines) {
  return render(<MemoryRouter><RepositoryProvider repositories={repositories as never}><InvoiceForm clock={{ today: () => '2026-08-10' as never }} invoice={invoice} /></RepositoryProvider></MemoryRouter>)
}

async function fillValidLine() {
  fireEvent.click(await screen.findByRole('button', { name: 'Add line' }))
  fireEvent.change(await screen.findByLabelText('Supplier'), { target: { value: 'supplier-1' } })
  fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2026-08-10' } })
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'category-1' } })
  fireEvent.change(screen.getByLabelText('Product reference'), { target: { value: 'BOLT' } })
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Steel bolt' } })
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Unit cost (minor units)'), { target: { value: '150' } })
}

describe('InvoiceForm', () => {
  afterEach(cleanup)

  it('creates a valid invoice with supplier and category IDs and computed line totals', async () => {
    const create = vi.fn(async () => existing)
    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create }, payments: { findByInvoice: async () => [] } })
    await fillValidLine()
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ supplierId: 'supplier-1', currency: 'USD', lines: [expect.objectContaining({ categoryId: 'category-1', productRef: 'BOLT', externalSku: null, quantity: 2, unitCostMinor: 150 })] })))
  })

  it('rejects no lines and invalid quantity, future issue date, and negative cost accessibly', async () => {
    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create: vi.fn() }, payments: { findByInvoice: async () => [] } })
    await screen.findByLabelText('Supplier')
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))
    expect(screen.getByRole('alert').textContent).toBe('Invoice requires at least one line')
    await fillValidLine()
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2026-08-11' } })
    fireEvent.change(screen.getByLabelText('Unit cost (minor units)'), { target: { value: '-100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))
    expect(screen.getByText('Date must not be in the future').textContent).toBe('Date must not be in the future')
    fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2026-08-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Quantity must be a positive finite number')
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1.2345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Quantity must have at most three decimal places')
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Money minor amount must be a non-negative safe integer')
  })

  it.each([
    ['supplier', async () => fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: '' } }), 'Value must not be empty'],
    ['category', async () => fireEvent.change(screen.getByLabelText('Category'), { target: { value: '' } }), 'Value must not be empty'],
    ['product reference', async () => fireEvent.change(screen.getByLabelText('Product reference'), { target: { value: '' } }), 'Value must not be empty'],
  ])('shows a visible error and does not create when the %s ID/value is missing', async (_field, clearField, message) => {
    const create = vi.fn()
    const update = vi.fn()
    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create, update }, payments: { findByInvoice: async () => [] } })
    await fillValidLine()
    await clearField()

    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))

    expect(screen.getByRole('alert').textContent).toBe(message)
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('allows editing an invoice without payments and blocks editing with active payments', async () => {
    const update = vi.fn(async () => existing)
    const repositories = { suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], update }, payments: { findByInvoice: async () => [] } }
    const { rerender } = renderForm(repositories, existing)
    await screen.findByLabelText('Supplier')
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-09-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith('invoice-1', expect.objectContaining({ dueDate: '2026-09-01' })))

    rerender(<MemoryRouter><RepositoryProvider repositories={{ ...repositories, payments: { findByInvoice: async () => [{ isVoid: false }] } } as never}><InvoiceForm clock={{ today: () => '2026-08-10' as never }} invoice={existing} /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByRole('alert')).textContent).toBe('Void all payments before editing')
    expect((screen.getByRole('button', { name: 'Save invoice' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByLabelText('Product reference') as HTMLInputElement).disabled).toBe(true)
  })
})
