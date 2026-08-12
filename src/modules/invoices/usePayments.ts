import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '../../app/useRepositories'
import type { InvoiceId, PaymentId } from '../../types/domain'
import type { RegisterPaymentInput } from './PaymentRepository'

export function usePayments(invoiceId: InvoiceId) {
  const { repositories, revision } = useRepositories()
  const [payments, setPayments] = useState<readonly import('../../types/domain').Payment[]>([])
  const [balance, setBalance] = useState<{ readonly remainingMinor: import('../../types/domain').MoneyMinor; readonly status: import('../../types/domain').InvoiceStatus } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextPayments, nextBalance] = await Promise.all([repositories.payments.findByInvoice(invoiceId), repositories.payments.getBalance(invoiceId)])
      setPayments(nextPayments)
      setBalance(nextBalance)
    } catch (reason) {
      setPayments([])
      setBalance(null)
      setError(reason instanceof Error ? reason.message : 'Could not load payments')
    } finally {
      setLoading(false)
    }
  }, [invoiceId, repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  const register = useCallback(async (input: RegisterPaymentInput) => {
    const payment = await repositories.payments.register(input)
    await refresh()
    return payment
  }, [refresh, repositories])
  const voidPayment = useCallback(async (id: PaymentId, reason: string) => {
    const payment = await repositories.payments.void(id, reason)
    await refresh()
    return payment
  }, [refresh, repositories])

  return { payments, balance, loading, error, refresh, register, voidPayment }
}
