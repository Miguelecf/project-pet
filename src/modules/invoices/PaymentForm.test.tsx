// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
})
