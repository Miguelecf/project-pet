// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { useRepositories } from '../../app/useRepositories'
import type { Invoice } from '../../types/domain'
import { useInvoices } from './useInvoices'

const pendingInvoice = { id: 'invoice-1', status: 'pending' } as unknown as Invoice

function InvoiceState() {
  const { error, invoices, loading, refresh } = useInvoices()
  return <><p>{loading ? 'loading invoices' : error ?? invoices.map((invoice) => invoice.id).join(',')}</p><button onClick={() => void refresh()} type="button">Retry invoice load</button></>
}

function RevisionState() {
  const { invoices } = useInvoices()
  const { restore } = useRepositories()
  return <><p>{invoices.map((invoice) => invoice.id).join(',')}</p><button onClick={() => void restore()} type="button">Restore invoices</button></>
}

describe('useInvoices', () => {
  afterEach(cleanup)

  it('loads invoices and exposes repository mutations', async () => {
    const findAll = vi.fn(async () => [pendingInvoice])
    const create = vi.fn()
    render(<RepositoryProvider repositories={{ invoices: { findAll, create } } as never}><InvoiceState /></RepositoryProvider>)

    expect(screen.getByText('loading invoices').textContent).toBe('loading invoices')
    await waitFor(() => expect(screen.getByText('invoice-1').textContent).toBe('invoice-1'))
    expect(findAll).toHaveBeenCalledTimes(1)
  })

  it('shows a repository error and can retry the load', async () => {
    const findAll = vi.fn().mockRejectedValueOnce(new Error('Invoice storage unavailable')).mockResolvedValueOnce([pendingInvoice])
    render(<RepositoryProvider repositories={{ invoices: { findAll } } as never}><InvoiceState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Invoice storage unavailable').textContent).toBe('Invoice storage unavailable'))
    fireEvent.click(screen.getByRole('button', { name: 'Retry invoice load' }))
    await waitFor(() => expect(screen.getByText('invoice-1').textContent).toBe('invoice-1'))
    expect(findAll).toHaveBeenCalledTimes(2)
  })

  it('uses the safe load message when a repository rejects with a non-Error value', async () => {
    render(<RepositoryProvider repositories={{ invoices: { findAll: async () => { throw 'offline' } } } as never}><InvoiceState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Could not load invoices').textContent).toBe('Could not load invoices'))
  })

  it('refetches invoices after the provider publishes a revision', async () => {
    const findAll = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([pendingInvoice])
    const restore = vi.fn(async () => undefined)
    render(<RepositoryProvider repositories={{ invoices: { findAll } } as never}><RevisionState /></RepositoryProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Restore invoices' }))
    await waitFor(() => expect(screen.getByText('invoice-1').textContent).toBe('invoice-1'))
    expect(restore).not.toHaveBeenCalled()
  })
})
