import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { InvoiceId, PaymentId, PaymentMethod } from '../../types/domain'
import { validateISODate, type Clock } from '../../utils/dates'
import { validateNonEmpty } from '../../utils/validation'
import { usePayments } from './usePayments'

interface PaymentFormProps {
  readonly clock?: Clock
  readonly invoiceId: InvoiceId
  readonly onChanged?: () => void
}

function systemClock(): Clock {
  return { today: () => new Date().toISOString().slice(0, 10) as never }
}

function validatePositiveMoney(value: string): number {
  const amount = Number(value)
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('Payment amount must be a positive safe integer')
  return amount
}

export function PaymentForm({ clock = systemClock(), invoiceId, onChanged }: PaymentFormProps) {
  const { balance, error: loadError, loading, payments, register, voidPayment } = usePayments(invoiceId)
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [error, setError] = useState<string | null>(null)
  const [voiding, setVoiding] = useState<{ readonly id: PaymentId; readonly reason: string } | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})

  async function submit() {
    try {
      const amountMinor = validatePositiveMoney(amount)
      const remainingMinor = balance?.remainingMinor
      if (remainingMinor === null || remainingMinor === undefined) throw new Error('Payment balance is unavailable')
      if (amountMinor > remainingMinor) throw new RangeError(`Payment exceeds remaining balance (${remainingMinor})`)
      await register({ invoiceId, amountMinor: amountMinor as never, paymentDate: validateISODate(paymentDate, clock, { kind: 'payment' }), method, reference: null, notes: null })
      setAmount('')
      setError(null)
      onChanged?.()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not register payment')
    }
  }

  function requestVoid(id: PaymentId) {
    try {
      const reason = validateNonEmpty(reasons[id] ?? '')
      setError(null)
      setVoiding({ id, reason })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message.replace('Value must not be empty', 'Void reason is required') : 'Void reason is required')
    }
  }

  async function confirmVoid() {
    if (!voiding) return
    try {
      await voidPayment(voiding.id, voiding.reason)
      setVoiding(null)
      setError(null)
      onChanged?.()
    } catch (reason) {
      setVoiding(null)
      setError(reason instanceof Error ? reason.message : 'Could not void payment')
    }
  }

  if (loading) return <p role="status">Loading payments.</p>

  return <section aria-labelledby="payment-form-title">
    <h2 id="payment-form-title">Register payment</h2>
    {(error ?? loadError) && <p role="alert">{error ?? loadError}</p>}
    {balance && <p aria-live="polite">Remaining balance: {balance.remainingMinor} — Status: {balance.status.replaceAll('_', ' ')}</p>}
    <label>Payment amount (minor units)<input aria-label="Payment amount (minor units)" onChange={(event) => setAmount(event.target.value)} value={amount} /></label>
    <label>Payment date<input aria-label="Payment date" onChange={(event) => setPaymentDate(event.target.value)} type="date" value={paymentDate} /></label>
    <label>Payment method<select aria-label="Payment method" onChange={(event) => setMethod(event.target.value as PaymentMethod)} value={method}><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="debit_card">Debit card</option><option value="credit_card">Credit card</option><option value="digital_wallet">Digital wallet</option></select></label>
    <button disabled={!balance || balance.remainingMinor === 0} onClick={() => void submit()} type="button">Register payment</button>
    {payments.filter((payment) => !payment.isVoid).map((payment) => <div key={payment.id}>
      <label>Void reason for {payment.id}<input aria-label={`Void reason for ${payment.id}`} onChange={(event) => setReasons((current) => ({ ...current, [payment.id]: event.target.value }))} value={reasons[payment.id] ?? ''} /></label>
      <button aria-label={`Void payment ${payment.id}`} onClick={() => requestVoid(payment.id)} type="button">Void payment</button>
    </div>)}
    <ConfirmDialog cancelLabel="Cancel" confirmLabel="Void payment" message={voiding ? `Void this payment? Reason: ${voiding.reason}` : ''} onCancel={() => setVoiding(null)} onConfirm={() => void confirmVoid()} open={voiding !== null} title="Void payment" />
  </section>
}
