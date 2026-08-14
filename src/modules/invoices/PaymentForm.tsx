import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { InvoiceId, PaymentId, PaymentMethod } from '../../types/domain'
import { validateISODate, type Clock } from '../../utils/dates'
import { validateNonEmpty } from '../../utils/validation'
import { usePayments } from './usePayments'
import { userFacingError } from '../../utils/userFacingErrors'

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
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('El monto del pago debe ser un número entero mayor que cero')
  return amount
}

export function PaymentForm({ clock = systemClock(), invoiceId, onChanged }: PaymentFormProps) {
  const { balance, error: loadError, loading, payments, refresh, register, voidPayment } = usePayments(invoiceId)
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [error, setError] = useState<string | null>(null)
  const [voiding, setVoiding] = useState<{ readonly id: PaymentId; readonly reason: string } | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})

  async function submit() {
    try {
      if (!amount.trim()) throw new RangeError('Completá el monto del pago')
      if (!paymentDate.trim()) throw new RangeError('Completá la fecha de pago')
      const amountMinor = validatePositiveMoney(amount)
      const remainingMinor = balance?.remainingMinor
      if (remainingMinor === null || remainingMinor === undefined) throw new Error('El saldo para el pago no está disponible')
      if (amountMinor > remainingMinor) throw new RangeError(`El pago supera el saldo pendiente (${remainingMinor})`)
      await register({ invoiceId, amountMinor: amountMinor as never, paymentDate: validateISODate(paymentDate, clock, { kind: 'payment' }), method, reference: null, notes: null })
      setAmount('')
      setError(null)
      onChanged?.()
    } catch (reason) {
      setError(userFacingError(reason, 'No pudimos registrar el pago'))
    }
  }

  function requestVoid(id: PaymentId) {
    try {
      const reason = validateNonEmpty(reasons[id] ?? '')
      setError(null)
      setVoiding({ id, reason })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message.replace('Value must not be empty', 'Completá el motivo de anulación') : 'Completá el motivo de anulación')
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
      setError(reason instanceof Error ? reason.message : 'No pudimos anular el pago')
    }
  }

  if (loading) return <p role="status">Cargando pagos.</p>

  return <section aria-labelledby="payment-form-title" className="form-page payment-form">
    <h2 id="payment-form-title">Registrar pago</h2>
    {(error ?? loadError) && <p role="alert">{error ?? loadError}</p>}
    {loadError && <button onClick={() => void refresh()} type="button">Reintentar</button>}
    {balance && <p aria-live="polite">Saldo pendiente: {balance.remainingMinor} — Estado: {balance.status === 'partially_paid' ? 'Pago parcial' : balance.status === 'paid' ? 'Pagada' : 'Pendiente'}</p>}
    <label>Monto del pago (unidades mínimas)<input aria-label="Monto del pago (unidades mínimas)" onChange={(event) => setAmount(event.target.value)} value={amount} /></label>
    <label>Fecha de pago<input aria-label="Fecha de pago" onChange={(event) => setPaymentDate(event.target.value)} type="date" value={paymentDate} /></label>
    <label>Método de pago<select aria-label="Método de pago" onChange={(event) => setMethod(event.target.value as PaymentMethod)} value={method}><option value="cash">Efectivo</option><option value="bank_transfer">Transferencia bancaria</option><option value="debit_card">Tarjeta de débito</option><option value="credit_card">Tarjeta de crédito</option><option value="digital_wallet">Billetera virtual</option></select></label>
    <button disabled={!balance || balance.remainingMinor === 0} onClick={() => void submit()} type="button">Registrar pago</button>
    {payments.filter((payment) => !payment.isVoid).map((payment) => <div key={payment.id}>
      <label>Motivo de anulación para {payment.id}<input aria-label={`Motivo de anulación para ${payment.id}`} onChange={(event) => setReasons((current) => ({ ...current, [payment.id]: event.target.value }))} value={reasons[payment.id] ?? ''} /></label>
      <button aria-label={`Anular pago ${payment.id}`} onClick={() => requestVoid(payment.id)} type="button">Anular pago</button>
    </div>)}
    <ConfirmDialog cancelLabel="Cancelar" confirmLabel="Anular pago" message={voiding ? `¿Anular este pago? Motivo: ${voiding.reason}` : ''} onCancel={() => setVoiding(null)} onConfirm={() => void confirmVoid()} open={voiding !== null} title="Anular pago" />
  </section>
}
