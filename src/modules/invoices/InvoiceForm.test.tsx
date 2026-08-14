// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

function formRepositories(create = vi.fn()) {
  return { suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create }, payments: { findByInvoice: async () => [] } }
}

async function fillValidLine() {
  fireEvent.click(await screen.findByRole('button', { name: 'Agregar línea' }))
  fireEvent.change(await screen.findByLabelText('Proveedor'), { target: { value: 'supplier-1' } })
  fireEvent.change(screen.getByLabelText('Fecha de emisión'), { target: { value: '2026-08-10' } })
  fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'category-1' } })
  fireEvent.change(screen.getByLabelText('Referencia del producto'), { target: { value: 'BOLT' } })
  fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Steel bolt' } })
  fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Costo unitario (unidades mínimas)'), { target: { value: '150' } })
}

describe('InvoiceForm', () => {
  afterEach(cleanup)

  it('creates a valid invoice with supplier and category IDs and computed line totals', async () => {
    const create = vi.fn(async () => existing)
    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create }, payments: { findByInvoice: async () => [] } })
    await fillValidLine()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ supplierId: 'supplier-1', currency: 'USD', lines: [expect.objectContaining({ categoryId: 'category-1', productRef: 'BOLT', externalSku: null, quantity: 2, unitCostMinor: 150 })] })))
  })

  it('rejects no lines and invalid quantity, future issue date, and negative cost accessibly', async () => {
    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create: vi.fn() }, payments: { findByInvoice: async () => [] } })
    await screen.findByLabelText('Proveedor')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('alert').textContent).toBe('Invoice requires at least one line')
    await fillValidLine()
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Fecha de emisión'), { target: { value: '2026-08-11' } })
    fireEvent.change(screen.getByLabelText('Costo unitario (unidades mínimas)'), { target: { value: '-100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByText('Date must not be in the future').textContent).toBe('Date must not be in the future')
    fireEvent.change(screen.getByLabelText('Fecha de emisión'), { target: { value: '2026-08-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Quantity must be a positive finite number')
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '1.2345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Quantity must have at most three decimal places')
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Money minor amount must be a non-negative safe integer')
  })

  it.each([
    ['supplier', async () => fireEvent.change(screen.getByLabelText('Proveedor'), { target: { value: '' } }), 'Value must not be empty'],
    ['category', async () => fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '' } }), 'Value must not be empty'],
    ['product reference', async () => fireEvent.change(screen.getByLabelText('Referencia del producto'), { target: { value: '' } }), 'Value must not be empty'],
  ])('shows a visible error and does not create when the %s ID/value is missing', async (_field, clearField, message) => {
    const create = vi.fn()
    const update = vi.fn()
    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create, update }, payments: { findByInvoice: async () => [] } })
    await fillValidLine()
    await clearField()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByRole('alert').textContent).toBe(message)
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('allows editing an invoice without payments and blocks editing with active payments', async () => {
    const update = vi.fn(async () => existing)
    const repositories = { suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], update }, payments: { findByInvoice: async () => [] } }
    const { rerender } = renderForm(repositories, existing)
    await screen.findByLabelText('Proveedor')
    fireEvent.change(screen.getByLabelText('Fecha de vencimiento'), { target: { value: '2026-09-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith('invoice-1', expect.objectContaining({ dueDate: '2026-09-01' })))

    rerender(<MemoryRouter><RepositoryProvider repositories={{ ...repositories, payments: { findByInvoice: async () => [{ isVoid: false }] } } as never}><InvoiceForm clock={{ today: () => '2026-08-10' as never }} invoice={existing} /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByRole('alert')).textContent).toBe('Anulá todos los pagos antes de editar')
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByLabelText('Referencia del producto') as HTMLInputElement).disabled).toBe(true)
  })

  it('reports catalog-load and active-payment lookup failures without saving', async () => {
    const create = vi.fn()
    renderForm({ suppliers: { findAll: async () => { throw new Error('Catalog unavailable') } }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create }, payments: { findByInvoice: async () => [] } })
    expect((await screen.findByRole('alert')).textContent).toBe('Catalog unavailable')
    expect(create).not.toHaveBeenCalled()
    cleanup()

    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create }, payments: { findByInvoice: async () => { throw new Error('Payment lookup unavailable') } } }, existing)
    expect((await screen.findByRole('alert')).textContent).toBe('Payment lookup unavailable')
  })

  it('submits optional invoice inputs as trimmed values or null and cancels through client navigation', async () => {
    const create = vi.fn(async () => existing)
    const { rerender } = render(<MemoryRouter><RepositoryProvider repositories={formRepositories(create) as never}><InvoiceForm clock={{ today: () => '2026-08-10' as never }} /></RepositoryProvider></MemoryRouter>)
    await fillValidLine()
    fireEvent.change(screen.getByLabelText('Fecha de vencimiento'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('Referencia del documento'), { target: { value: ' INV-9 ' } })
    fireEvent.change(screen.getByLabelText('Notas'), { target: { value: ' note ' } })
    fireEvent.change(screen.getByLabelText('SKU externo'), { target: { value: ' SKU-9 ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ docRef: 'INV-9', dueDate: '2026-09-01', notes: 'note', lines: [expect.objectContaining({ externalSku: 'SKU-9' })] })))

    rerender(<MemoryRouter initialEntries={['/invoices/new']}><RepositoryProvider repositories={formRepositories() as never}><InvoiceForm clock={{ today: () => '2026-08-10' as never }} /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
  })

  it('uses the default clock deterministically when no clock is supplied', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-10T12:00:00.000Z'))
    try {
      render(<MemoryRouter><RepositoryProvider repositories={formRepositories() as never}><InvoiceForm /></RepositoryProvider></MemoryRouter>)
      await vi.runAllTimersAsync()
      fireEvent.click(screen.getByRole('button', { name: 'Agregar línea' }))
      fireEvent.change(screen.getByLabelText('Proveedor'), { target: { value: 'supplier-1' } })
      fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'category-1' } })
      fireEvent.change(screen.getByLabelText('Referencia del producto'), { target: { value: 'BOLT' } })
      fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Steel bolt' } })
      fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '2' } })
      fireEvent.change(screen.getByLabelText('Costo unitario (unidades mínimas)'), { target: { value: '150' } })
      fireEvent.change(screen.getByLabelText('Fecha de emisión'), { target: { value: '2026-08-11' } })
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toContain('Date must not be in the future')
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores catalog and payment-check completions after unmount without leaking state', async () => {
    let resolveCatalog!: (value: readonly Supplier[]) => void
    let resolvePayments!: (value: readonly unknown[]) => void
    const catalog = new Promise<readonly Supplier[]>((resolve) => { resolveCatalog = resolve })
    const payments = new Promise<readonly unknown[]>((resolve) => { resolvePayments = resolve })
    const { unmount } = renderForm({ suppliers: { findAll: () => catalog }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [] }, payments: { findByInvoice: () => payments } }, existing)

    unmount()
    await act(async () => { resolveCatalog([supplier]); resolvePayments([{ isVoid: false }]) })
  })

  it('ignores catalog and payment-check rejections after unmount without leaking state', async () => {
    let rejectCatalog!: (reason: unknown) => void
    let rejectPayments!: (reason: unknown) => void
    const catalog = new Promise<readonly Supplier[]>((_, reject) => { rejectCatalog = reject })
    const payments = new Promise<readonly unknown[]>((_, reject) => { rejectPayments = reject })
    const { unmount } = renderForm({ suppliers: { findAll: () => catalog }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [] }, payments: { findByInvoice: () => payments } }, existing)

    unmount()
    await act(async () => { rejectCatalog(new Error('offline')); rejectPayments(new Error('offline')) })
  })

  it('uses safe fallbacks for non-Error catalog, payment-check, and save failures', async () => {
    renderForm({ suppliers: { findAll: async () => { throw 'offline' } }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [] }, payments: { findByInvoice: async () => [] } })
    expect((await screen.findByRole('alert')).textContent).toBe('No pudimos cargar el formulario de factura')
    cleanup()

    renderForm({ suppliers: { findAll: async () => [supplier] }, categories: { findAll: async () => [category] }, settings: { get: async () => ({ currency: 'USD' }) }, invoices: { findAll: async () => [], create: async () => { throw 'offline' } }, payments: { findByInvoice: async () => { throw 'offline' } } }, existing)
    expect((await screen.findByRole('alert')).textContent).toBe('No pudimos verificar los pagos de la factura')
    cleanup()

    renderForm({ ...formRepositories(vi.fn(async () => { throw 'offline' })) })
    await fillValidLine()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect((await screen.findByRole('alert')).textContent).toBe('No pudimos guardar la factura')
  })
})
