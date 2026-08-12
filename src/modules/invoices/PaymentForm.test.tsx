// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import { PaymentForm } from './PaymentForm'

const invoiceId = 'invoice-1' as never

function renderForm({ remainingMinor = 1000, payments = [], register = vi.fn(async () => ({})), voidPayment = vi.fn(async () => ({})) } = {}) {
  return {
    register,
    voidPayment,
    ...render(<RepositoryProvider repositories={{ payments: { findByInvoice: async () => payments, getBalance: async () => ({ remainingMinor, status: remainingMinor === 0 ? 'paid' : remainingMinor === 1000 ? 'pending' : 'partially_paid' }), register, void: voidPayment } } as never}>
      <PaymentForm clock={{ today: () => '2026-08-10' as never }} invoiceId={invoiceId} onChanged={vi.fn()} />
    </RepositoryProvider>),
  }
}

function submit(amount: string, date = '2026-08-10') {
  fireEvent.change(screen.getByLabelText('Payment amount (minor units)'), { target: { value: amount } })
  fireEvent.change(screen.getByLabelText('Payment date'), { target: { value: date } })
  fireEvent.click(screen.getByRole('button', { name: 'Register payment' }))
}

describe('PaymentForm', () => {
  afterEach(cleanup)

  it('registers partial and exact payments with accessible derived balance feedback', async () => {
    const partial = renderForm({ remainingMinor: 1000 })
    await screen.findByText(/Remaining balance: 1000/)
    submit('400')
    await waitFor(() => expect(partial.register).toHaveBeenCalledWith(expect.objectContaining({ amountMinor: 400, paymentDate: '2026-08-10', method: 'cash' })))

    cleanup()
    const exact = renderForm({ remainingMinor: 1000 })
    await screen.findByText(/Remaining balance: 1000/)
    submit('1000')
    await waitFor(() => expect(exact.register).toHaveBeenCalledWith(expect.objectContaining({ amountMinor: 1000 })))
  })

  it('rejects zero, future dates, and overpayments against the current remaining balance', async () => {
    const { register } = renderForm({ remainingMinor: 200 })
    await screen.findByText(/Remaining balance: 200/)
    submit('0')
    expect(screen.getByRole('alert').textContent).toBe('Payment amount must be a positive safe integer')
    submit('100', '2026-08-11')
    expect(screen.getByRole('alert').textContent).toBe('Date must not be in the future')
    submit('300')
    expect(screen.getByRole('alert').textContent).toBe('Payment exceeds remaining balance (200)')
    expect(register).not.toHaveBeenCalled()
  })

  it('retries a failed payment load from the production form and restores its controls and status', async () => {
    const findByInvoice = vi.fn(async () => [])
    findByInvoice.mockRejectedValueOnce(new Error('Payment storage unavailable'))
    render(<RepositoryProvider repositories={{ payments: { findByInvoice, getBalance: async () => ({ remainingMinor: 1000, status: 'pending' }), register: vi.fn(async () => ({})), void: vi.fn(async () => ({})) } } as never}>
      <PaymentForm clock={{ today: () => '2026-08-10' as never }} invoiceId={invoiceId} />
    </RepositoryProvider>)

    expect((await screen.findByRole('alert')).textContent).toBe('Payment storage unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Retry payment load' }))
    expect(await screen.findByText('Remaining balance: 1000 — Status: pending')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Retry payment load' })).toBeNull()
    expect(screen.getByLabelText('Payment amount (minor units)')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Register payment' }).hasAttribute('disabled')).toBe(false)
  })

  it('requires a reason and confirmation to void, preserves on cancellation, and refreshes the restored balance', async () => {
    const voidPayment = vi.fn(async () => ({}))
    renderForm({ remainingMinor: 600, payments: [{ id: 'payment-1', amountMinor: 400, method: 'cash', isVoid: false }] as never, voidPayment })
    await screen.findByRole('button', { name: 'Void payment payment-1' })
    fireEvent.click(screen.getByRole('button', { name: 'Void payment payment-1' }))
    expect(screen.getByRole('alert').textContent).toBe('Void reason is required')
    fireEvent.change(screen.getByLabelText('Void reason for payment-1'), { target: { value: 'Duplicate entry' } })
    fireEvent.click(screen.getByRole('button', { name: 'Void payment payment-1' }))
    expect(screen.getByRole('dialog').textContent).toContain('Duplicate entry')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(voidPayment).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Void payment payment-1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Void payment' }))
    await waitFor(() => expect(voidPayment).toHaveBeenCalledWith('payment-1', 'Duplicate entry'))
  })

  it('reports register and void repository failures while preserving the form state', async () => {
    const register = vi.fn(async () => { throw new Error('Payment persistence unavailable') })
    const voidPayment = vi.fn(async () => { throw new Error('Void persistence unavailable') })
    renderForm({ remainingMinor: 1000, payments: [{ id: 'payment-1', amountMinor: 400, method: 'cash', isVoid: false }] as never, register, voidPayment })
    await screen.findByText(/Remaining balance: 1000/)
    submit('400')
    expect((await screen.findByRole('alert')).textContent).toBe('Payment persistence unavailable')
    expect((screen.getByLabelText('Payment amount (minor units)') as HTMLInputElement).value).toBe('400')
    fireEvent.change(screen.getByLabelText('Void reason for payment-1'), { target: { value: 'Duplicate entry' } })
    fireEvent.click(screen.getByRole('button', { name: 'Void payment payment-1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Void payment' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Void persistence unavailable')
  })

  it('submits the selected payment method and disables registration when no balance remains', async () => {
    const register = vi.fn(async () => ({}))
    const { rerender } = renderForm({ remainingMinor: 1000, register })
    await screen.findByText(/Remaining balance: 1000/)
    fireEvent.change(screen.getByLabelText('Payment method'), { target: { value: 'bank_transfer' } })
    submit('100')
    await waitFor(() => expect(register).toHaveBeenCalledWith(expect.objectContaining({ method: 'bank_transfer' })))

    rerender(<RepositoryProvider repositories={{ payments: { findByInvoice: async () => [], getBalance: async () => ({ remainingMinor: 0, status: 'paid' }), register } } as never}><PaymentForm clock={{ today: () => '2026-08-10' as never }} invoiceId={invoiceId} /></RepositoryProvider>)
    expect((await screen.findByRole('button', { name: 'Register payment' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('uses safe messages when payment mutations reject with non-Error values', async () => {
    const register = vi.fn(async () => { throw 'offline' })
    const voidPayment = vi.fn(async () => { throw 'offline' })
    renderForm({ remainingMinor: 1000, payments: [{ id: 'payment-1', amountMinor: 400, method: 'cash', isVoid: false }] as never, register, voidPayment })
    await screen.findByText(/Remaining balance: 1000/)
    submit('400')
    expect((await screen.findByRole('alert')).textContent).toBe('Could not register payment')
    fireEvent.change(screen.getByLabelText('Void reason for payment-1'), { target: { value: 'Duplicate entry' } })
    fireEvent.click(screen.getByRole('button', { name: 'Void payment payment-1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Void payment' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Could not void payment')
  })

  it('uses the default clock deterministically for payment dates', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-10T12:00:00.000Z'))
    try {
      render(<RepositoryProvider repositories={{ payments: { findByInvoice: async () => [], getBalance: async () => ({ remainingMinor: 1000, status: 'pending' }), register: vi.fn() } } as never}><PaymentForm invoiceId={invoiceId} /></RepositoryProvider>)
      await act(async () => { await Promise.resolve(); await Promise.resolve() })
      expect(screen.getByText(/Remaining balance: 1000/)).toBeTruthy()
      submit('100', '2026-08-11')
      expect(screen.getByRole('alert').textContent).toBe('Date must not be in the future')
    } finally {
      vi.useRealTimers()
    }
  })
})
