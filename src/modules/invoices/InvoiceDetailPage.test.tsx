// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { InvoiceDetailPage } from './InvoiceDetailPage'

const invoice = { id: 'invoice-1', supplierId: 'supplier-1', docRef: 'INV-100', issueDate: '2026-08-01', dueDate: '2026-08-15', currency: 'USD', totalMinor: 1000, status: 'paid', notes: 'Stock order', deletedAt: null } as never
const lines = [{ id: 'line-1', categoryId: 'category-1', productRef: 'BOLT', externalSku: 'SKU-1', description: 'Steel bolt', quantity: 2, unitCostMinor: 500, lineTotalMinor: 1000, position: 1 }] as never

function renderDetail(payments = [{ id: 'payment-1', amountMinor: 400, paymentDate: '2026-08-02', method: 'cash', isVoid: false }]) {
  return render(<MemoryRouter><RepositoryProvider repositories={{
    invoices: { findById: async () => ({ invoice, lines }) },
    payments: { findByInvoice: async () => payments },
    suppliers: { findAll: async () => [{ id: 'supplier-1', name: 'Acme Supplies' }] },
    categories: { findAll: async () => [{ id: 'category-1', name: 'Hardware' }] },
  } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)
}

describe('InvoiceDetailPage', () => {
  afterEach(cleanup)

  it('shows contextual lines, payment history, totals, balance, and payment-derived status', async () => {
    renderDetail()

    expect((await screen.findByRole('heading', { level: 1, name: 'INV-100' })).textContent).toBe('INV-100')
    expect(screen.getByText('Supplier: Acme Supplies').textContent).toBe('Supplier: Acme Supplies')
    expect(screen.getByText('Category: Hardware').textContent).toBe('Category: Hardware')
    expect(screen.getByText('Steel bolt').textContent).toBe('Steel bolt')
    expect(screen.getByText('Cash: 400').textContent).toBe('Cash: 400')
    expect(screen.getByText('Total: 1000').textContent).toBe('Total: 1000')
    expect(screen.getByText('Balance: 600').textContent).toBe('Balance: 600')
    expect(screen.getByText('Partially paid').textContent).toBe('Partially paid')
    expect(screen.queryByRole('link', { name: 'Edit invoice' })).toBeNull()
  })

  it('offers editing only with no active payments and reports not-found and load failures', async () => {
    const { rerender } = renderDetail([{ id: 'voided', amountMinor: 1000, paymentDate: '2026-08-02', method: 'cash', isVoid: true }])
    expect((await screen.findByRole('link', { name: 'Edit invoice' })).getAttribute('href')).toBe('/invoices/invoice-1/edit')

    rerender(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findById: async () => null }, payments: { findByInvoice: async () => [] }, suppliers: { findAll: async () => [] }, categories: { findAll: async () => [] } } as never}><InvoiceDetailPage invoiceId={'missing' as never} /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByText('Invoice not found.')).textContent).toBe('Invoice not found.')
  })

  it('shows a repository error and retries the detail load', async () => {
    const findById = vi.fn().mockRejectedValueOnce(new Error('Invoice storage unavailable')).mockResolvedValueOnce({ invoice, lines })
    render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findById }, payments: { findByInvoice: async () => [] }, suppliers: { findAll: async () => [] }, categories: { findAll: async () => [] } } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)

    expect((await screen.findByRole('alert')).textContent).toContain('Invoice storage unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'INV-100' }).textContent).toBe('INV-100'))
    expect(findById).toHaveBeenCalledTimes(2)
  })

  it('confirms deletion with no active payments, cancels without mutation, and blocks active payments', async () => {
    const softDelete = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findById: async () => ({ invoice, lines }), softDelete },
      payments: { findByInvoice: async () => [], getBalance: async () => ({ remainingMinor: 1000, status: 'pending' }) },
      suppliers: { findAll: async () => [] },
      categories: { findAll: async () => [] },
    } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Delete invoice' }))
    expect(screen.getByRole('dialog').textContent).toContain('Delete invoice?')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(softDelete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Delete invoice' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete invoice' }))
    await waitFor(() => expect(softDelete).toHaveBeenCalledWith('invoice-1'))

    rerender(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findById: async () => ({ invoice, lines }), softDelete },
      payments: { findByInvoice: async () => [{ id: 'payment-1', amountMinor: 400, method: 'cash', isVoid: false }], getBalance: async () => ({ remainingMinor: 600, status: 'partially_paid' }) },
      suppliers: { findAll: async () => [] },
      categories: { findAll: async () => [] },
    } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Delete invoice' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete invoice' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Cannot delete: void all payments first')
    expect(softDelete).toHaveBeenCalledTimes(1)
  })

  it('allows deletion after every payment has been voided', async () => {
    const softDelete = vi.fn().mockResolvedValue(undefined)
    render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findById: async () => ({ invoice, lines }), softDelete },
      payments: { findByInvoice: async () => [{ id: 'voided', amountMinor: 400, method: 'cash', isVoid: true }], getBalance: async () => ({ remainingMinor: 1000, status: 'pending' }) },
      suppliers: { findAll: async () => [] },
      categories: { findAll: async () => [] },
    } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Delete invoice' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete invoice' }))
    await waitFor(() => expect(softDelete).toHaveBeenCalledWith('invoice-1'))
  })

  it('uses safe display fallbacks and reports a repository delete failure', async () => {
    const softDelete = vi.fn(async () => { throw new Error('Delete unavailable') })
    render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findById: async () => ({ invoice: { id: 'invoice-1', supplierId: 'supplier-1', docRef: null, issueDate: '2026-08-01', dueDate: null, currency: 'USD', totalMinor: 1000, status: 'pending', notes: null, deletedAt: null }, lines: [{ id: 'line-1', categoryId: 'unknown', productRef: 'BOLT', externalSku: null, description: 'Steel bolt', quantity: 2, unitCostMinor: 500, lineTotalMinor: 1000, position: 1 }] }) as never, softDelete },
      payments: { findByInvoice: async () => [], getBalance: async () => ({ remainingMinor: 1000, status: 'pending' }) },
      suppliers: { findAll: async () => [] },
      categories: { findAll: async () => [] },
    } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)

    expect((await screen.findByRole('heading', { level: 1, name: 'Invoice invoice-1' })).textContent).toBe('Invoice invoice-1')
    expect(screen.getByText('Supplier: Unknown supplier').textContent).toBe('Supplier: Unknown supplier')
    expect(screen.getByText('Category: Unknown category').textContent).toBe('Category: Unknown category')
    expect(screen.getByText('No payments recorded.').textContent).toBe('No payments recorded.')
    expect(screen.queryByText('Due date: 2026-08-15')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Delete invoice' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete invoice' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Delete unavailable')
  })

  it('uses safe load and delete error fallbacks for non-Error repository failures', async () => {
    const { rerender } = render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findById: async () => { throw 'offline' } }, payments: { findByInvoice: async () => [] }, suppliers: { findAll: async () => [] }, categories: { findAll: async () => [] } } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load invoice')

    rerender(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findById: async () => ({ invoice, lines }), softDelete: async () => { throw 'offline' } }, payments: { findByInvoice: async () => [], getBalance: async () => ({ remainingMinor: 1000, status: 'pending' }) }, suppliers: { findAll: async () => [] }, categories: { findAll: async () => [] } } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Delete invoice' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete invoice' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Could not delete invoice')
  })

  it('ignores an asynchronous detail completion after unmount', async () => {
    let resolveDetail!: (value: unknown) => void
    const detailLoad = new Promise((resolve) => { resolveDetail = resolve })
    const { unmount } = render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findById: () => detailLoad }, payments: { findByInvoice: async () => [] }, suppliers: { findAll: async () => [] }, categories: { findAll: async () => [] } } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)
    unmount()
    await act(async () => { resolveDetail({ invoice, lines }) })
  })

  it('ignores an asynchronous detail rejection after unmount', async () => {
    let rejectDetail!: (reason: unknown) => void
    const detailLoad = new Promise((_, reject) => { rejectDetail = reject })
    const { unmount } = render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findById: () => detailLoad }, payments: { findByInvoice: async () => [] }, suppliers: { findAll: async () => [] }, categories: { findAll: async () => [] } } as never}><InvoiceDetailPage invoiceId={'invoice-1' as never} /></RepositoryProvider></MemoryRouter>)
    unmount()
    await act(async () => { rejectDetail(new Error('offline')) })
  })
})
