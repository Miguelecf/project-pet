// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { InvoiceListPage } from './InvoiceListPage'

const invoices = [
  { id: 'pending', docRef: 'INV-100', totalMinor: 1000, status: 'paid', deletedAt: null },
  { id: 'partial', docRef: 'INV-200', totalMinor: 1000, status: 'pending', deletedAt: null },
  { id: 'paid', docRef: 'INV-300', totalMinor: 1000, status: 'pending', deletedAt: null },
] as never

function renderList(findAll = async () => invoices) {
  return render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll }, payments: { findByInvoice: async (id: string) => id === 'partial' ? [{ amountMinor: 400, isVoid: false }] : id === 'paid' ? [{ amountMinor: 1000, isVoid: false }] : [] } } as never}><InvoiceListPage /><Location /></RepositoryProvider></MemoryRouter>)
}

function Location() { return <p>{useLocation().pathname}</p> }

describe('InvoiceListPage', () => {
  afterEach(cleanup)

  it('renders active invoices with statuses derived from payment state and links each to its detail', async () => {
    renderList()

    expect((await screen.findByRole('link', { name: 'INV-100' })).getAttribute('href')).toBe('/invoices/pending')
    expect((await screen.findByLabelText('Status: Pending')).textContent).toBe('Pending')
    expect((await screen.findByLabelText('Status: Partially paid')).textContent).toBe('Partially paid')
    expect((await screen.findByLabelText('Status: Paid')).textContent).toBe('Paid')
  })

  it('uses client navigation for invoice links and offers New Invoice from an empty list', async () => {
    const { rerender } = renderList()
    fireEvent.click(await screen.findByRole('link', { name: 'INV-100' }))
    expect(screen.getByText('/invoices/pending').textContent).toBe('/invoices/pending')

    rerender(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll: async () => [] }, payments: { findByInvoice: async () => [] } } as never}><InvoiceListPage /><Location /></RepositoryProvider></MemoryRouter>)
    expect((await screen.findByRole('button', { name: 'New Invoice' })).textContent).toBe('New Invoice')
    expect(screen.getByText('No invoices yet.').textContent).toBe('No invoices yet.')
    fireEvent.click(screen.getByRole('button', { name: 'New Invoice' }))
    expect(screen.getByText('/invoices/new').textContent).toBe('/invoices/new')
  })

  it('shows retained invoices only through the deleted filter and restores them after confirmation', async () => {
    const deleted = [{ id: 'deleted', docRef: 'INV-DELETED', totalMinor: 1000, status: 'pending', deletedAt: '2026-08-10T00:00:00.000Z' }] as never
    const findDeleted = vi.fn().mockResolvedValue(deleted)
    const restore = vi.fn().mockResolvedValue({ id: 'deleted', docRef: 'INV-DELETED', totalMinor: 1000, status: 'pending', deletedAt: null })
    render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findAll: async () => invoices, findDeleted, restore },
      payments: { findByInvoice: async () => [] },
    } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)

    expect(await screen.findByRole('link', { name: 'INV-100' })).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show deleted invoices' }))
    expect(await screen.findByRole('link', { name: 'INV-DELETED' })).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'INV-100' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Restore INV-DELETED' }))
    expect(screen.getByRole('dialog').textContent).toContain('Restore invoice?')
    fireEvent.click(screen.getByRole('button', { name: 'Restore invoice' }))
    await waitFor(() => expect(restore).toHaveBeenCalledWith('deleted'))
    expect(await screen.findByRole('link', { name: 'INV-100' })).not.toBeNull()
  })

  it('shows payment and deleted-query failures with a retryable error state', async () => {
    const findAll = vi.fn().mockResolvedValue(invoices)
    const findByInvoice = vi.fn().mockRejectedValueOnce(new Error('Payment lookup unavailable')).mockResolvedValue([])
    const findDeleted = vi.fn().mockRejectedValue(new Error('Deleted invoices unavailable'))
    render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll, findDeleted }, payments: { findByInvoice } } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)

    expect((await screen.findByRole('alert')).textContent).toContain('Payment lookup unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.getByRole('link', { name: 'INV-100' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Show deleted invoices' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Deleted invoices unavailable')
  })

  it('reports a restore failure without silently returning the invoice to the active list', async () => {
    const deleted = [{ id: 'deleted', docRef: 'INV-DELETED', totalMinor: 1000, status: 'pending', deletedAt: '2026-08-10T00:00:00.000Z' }] as never
    render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findAll: async () => invoices, findDeleted: async () => deleted, restore: async () => { throw new Error('Restore unavailable') } },
      payments: { findByInvoice: async () => [] },
    } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Show deleted invoices' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Restore INV-DELETED' }))
    fireEvent.click(screen.getByRole('button', { name: 'Restore invoice' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Restore unavailable')
    expect(screen.queryByRole('link', { name: 'INV-100' })).toBeNull()
  })

  it('uses safe error and document-reference fallbacks and supports canceling a restore', async () => {
    const anonymous = [{ id: 'anonymous', docRef: null, totalMinor: 1000, status: 'pending', deletedAt: null }] as never
    const deleted = [{ id: 'deleted', docRef: null, totalMinor: 1000, status: 'pending', deletedAt: '2026-08-10T00:00:00.000Z' }] as never
    render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findAll: async () => anonymous, findDeleted: async () => deleted },
      payments: { findByInvoice: async () => { throw 'offline' } },
    } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)

    expect((await screen.findByRole('alert')).textContent).toContain('Could not load invoice payments')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByRole('link', { name: 'Invoice anonymous' })
    fireEvent.click(screen.getByRole('button', { name: 'Show deleted invoices' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Restore Invoice deleted' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('shows no deleted records and can return to active records without a mutation', async () => {
    const findDeleted = vi.fn(async () => [])
    render(<MemoryRouter><RepositoryProvider repositories={{
      invoices: { findAll: async () => invoices, findDeleted },
      payments: { findByInvoice: async () => [] },
    } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Show deleted invoices' }))
    expect(await screen.findByText('No deleted invoices.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Show active invoices' }))
    expect(await screen.findByRole('link', { name: 'INV-100' })).toBeTruthy()
    expect(findDeleted).toHaveBeenCalledTimes(1)
  })

  it('ignores asynchronous payment and deleted-query completions after unmount', async () => {
    let resolvePayments!: (value: readonly unknown[]) => void
    let resolveDeleted!: (value: readonly unknown[]) => void
    const paymentLoad = new Promise<readonly unknown[]>((resolve) => { resolvePayments = resolve })
    const deletedLoad = new Promise<readonly unknown[]>((resolve) => { resolveDeleted = resolve })
    const { unmount } = render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll: async () => invoices, findDeleted: () => deletedLoad }, payments: { findByInvoice: () => paymentLoad } } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Show deleted invoices' }))
    unmount()
    await Promise.resolve()
    await Promise.resolve()
    await act(async () => { resolvePayments([]); resolveDeleted([]) })
  })

  it('ignores asynchronous payment and deleted-query rejections after unmount', async () => {
    let rejectPayments!: (reason: unknown) => void
    let rejectDeleted!: (reason: unknown) => void
    const paymentLoad = new Promise<readonly unknown[]>((_, reject) => { rejectPayments = reject })
    const deletedLoad = new Promise<readonly unknown[]>((_, reject) => { rejectDeleted = reject })
    const { unmount } = render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll: async () => invoices, findDeleted: () => deletedLoad }, payments: { findByInvoice: () => paymentLoad } } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Show deleted invoices' }))
    unmount()
    await act(async () => { rejectPayments(new Error('offline')); rejectDeleted(new Error('offline')) })
  })

  it('uses safe non-Error fallbacks for deleted queries and restore failures', async () => {
    render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll: async () => invoices, findDeleted: async () => { throw 'offline' } }, payments: { findByInvoice: async () => [] } } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Show deleted invoices' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load deleted invoices')
    cleanup()

    const deleted = [{ id: 'deleted', docRef: 'INV-DELETED', totalMinor: 1000, status: 'pending', deletedAt: '2026-08-10T00:00:00.000Z' }] as never
    render(<MemoryRouter><RepositoryProvider repositories={{ invoices: { findAll: async () => invoices, findDeleted: async () => deleted, restore: async () => { throw 'offline' } }, payments: { findByInvoice: async () => [] } } as never}><InvoiceListPage /></RepositoryProvider></MemoryRouter>)
    fireEvent.click(await screen.findByRole('button', { name: 'Show deleted invoices' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Restore INV-DELETED' }))
    fireEvent.click(screen.getByRole('button', { name: 'Restore invoice' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Could not restore invoice')
  })
})
