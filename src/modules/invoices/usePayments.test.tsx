// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { useRepositories } from '../../app/useRepositories'
import type { Payment } from '../../types/domain'
import { usePayments } from './usePayments'

const payment = { id: 'payment-1', invoiceId: 'invoice-1', amountMinor: 400, paymentDate: '2026-08-10', method: 'cash', reference: null, notes: null, isVoid: false } as unknown as Payment

function PaymentState() {
  const { balance, error, loading, payments, refresh, register, voidPayment } = usePayments('invoice-1' as never)
  return <>
    <p>{loading ? 'loading payments' : error ?? `${payments.map((item) => item.id).join(',')}|${balance?.remainingMinor}|${balance?.status}`}</p>
    <button onClick={() => void refresh()} type="button">Retry payment load</button>
    <button onClick={() => void register({ invoiceId: 'invoice-1' as never, amountMinor: 400 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })} type="button">Register payment</button>
    <button onClick={() => void voidPayment('payment-1' as never, 'duplicate entry')} type="button">Void payment</button>
  </>
}

function RevisionState() {
  const { payments } = usePayments('invoice-1' as never)
  const { restore } = useRepositories()
  return <><p>{payments.map((item) => item.id).join(',')}</p><button onClick={() => void restore()} type="button">Restore payments</button></>
}

describe('usePayments', () => {
  afterEach(cleanup)

  it('loads balance and payments and delegates registration and void mutations', async () => {
    const findByInvoice = vi.fn(async () => [payment])
    const getBalance = vi.fn(async () => ({ remainingMinor: 600, status: 'partially_paid' }))
    const register = vi.fn(async () => payment)
    const voidPayment = vi.fn(async () => ({ ...payment, isVoid: true }))
    render(<RepositoryProvider repositories={{ payments: { findByInvoice, getBalance, register, void: voidPayment } } as never}><PaymentState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('payment-1|600|partially_paid').textContent).toBe('payment-1|600|partially_paid'))
    fireEvent.click(screen.getByRole('button', { name: 'Register payment' }))
    fireEvent.click(screen.getByRole('button', { name: 'Void payment' }))
    await waitFor(() => expect(register).toHaveBeenCalledWith(expect.objectContaining({ amountMinor: 400 })))
    expect(voidPayment).toHaveBeenCalledWith('payment-1', 'duplicate entry')
  })

  it('exposes load errors, retries, and refetches when provider revision changes', async () => {
    const findByInvoice = vi.fn(async () => [payment])
    const getBalance = vi.fn(async () => ({ remainingMinor: 600, status: 'partially_paid' }))
    findByInvoice.mockRejectedValueOnce(new Error('Payment storage unavailable'))
    const { unmount } = render(<RepositoryProvider repositories={{ payments: { findByInvoice, getBalance } } as never}><PaymentState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Payment storage unavailable').textContent).toBe('Payment storage unavailable'))
    fireEvent.click(screen.getByRole('button', { name: 'Retry payment load' }))
    await waitFor(() => expect(screen.getByText('payment-1|600|partially_paid').textContent).toBe('payment-1|600|partially_paid'))
    unmount()

    findByInvoice.mockResolvedValueOnce([]).mockResolvedValueOnce([{ ...payment, id: 'payment-2' } as Payment])
    render(<RepositoryProvider repositories={{ payments: { findByInvoice, getBalance } } as never}><RevisionState /></RepositoryProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Restore payments' }))
    await waitFor(() => expect(screen.getByText('payment-2').textContent).toBe('payment-2'))
  })

  it('uses the safe load message when either payment read rejects with a non-Error value', async () => {
    render(<RepositoryProvider repositories={{ payments: { findByInvoice: async () => { throw 'offline' }, getBalance: async () => ({ remainingMinor: 600, status: 'partially_paid' }) } } as never}><PaymentState /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByText('Could not load payments').textContent).toBe('Could not load payments'))
  })
})
