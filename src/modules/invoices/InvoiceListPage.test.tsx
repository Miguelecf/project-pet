// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
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
  })
})
