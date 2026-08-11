import type { ActivePayment, InvoiceId, InvoiceStatus, ISODateTime, MoneyMinor, Payment, PaymentId, VoidedPayment } from '../../types/domain'
import type { PaymentRepository, RegisterPaymentInput } from '../../modules/invoices/PaymentRepository'
import { LocalStateGateway } from './LocalStateGateway'

interface LocalPaymentRepositoryOptions {
  readonly now?: () => ISODateTime
  readonly nextId?: () => PaymentId
}

export class LocalPaymentRepository implements PaymentRepository {
  private readonly gateway: LocalStateGateway
  private readonly now: () => ISODateTime
  private readonly nextId: () => PaymentId

  constructor(gateway: LocalStateGateway, options: LocalPaymentRepositoryOptions = {}) {
    this.gateway = gateway
    this.now = options.now ?? (() => new Date().toISOString() as ISODateTime)
    this.nextId = options.nextId ?? (() => crypto.randomUUID() as PaymentId)
  }

  async findByInvoice(invoiceId: InvoiceId): Promise<readonly Payment[]> { return this.gateway.read().payments.filter((payment) => payment.invoiceId === invoiceId) }
  async getBalance(invoiceId: InvoiceId): Promise<{ readonly remainingMinor: MoneyMinor; readonly status: InvoiceStatus }> {
    const state = this.gateway.read()
    return calculateBalance(state.invoices.find((invoice) => invoice.id === invoiceId), state.payments.filter((payment) => payment.invoiceId === invoiceId))
  }
  async register(input: RegisterPaymentInput): Promise<ActivePayment> {
    const state = this.gateway.read()
    const balance = calculateBalance(state.invoices.find((invoice) => invoice.id === input.invoiceId), state.payments.filter((payment) => payment.invoiceId === input.invoiceId))
    if ((input.amountMinor as number) > (balance.remainingMinor as number)) throw new Error('overpayment')
    const payment: ActivePayment = { id: this.nextId(), ...input, isVoid: false, voidedAt: null, voidReason: null, createdAt: this.now() }
    state.payments.push(payment)
    updateInvoiceStatus(state, input.invoiceId, this.now())
    await this.gateway.write(state)
    return payment
  }
  async void(id: PaymentId, reason: string): Promise<VoidedPayment> {
    const state = this.gateway.read()
    const index = state.payments.findIndex((payment) => payment.id === id)
    if (index < 0 || state.payments[index].isVoid) throw new Error('payment not found')
    const payment = state.payments[index]
    const voided: VoidedPayment = { ...payment, isVoid: true, voidedAt: this.now(), voidReason: requireText(reason) as never }
    state.payments[index] = voided
    updateInvoiceStatus(state, payment.invoiceId, this.now())
    await this.gateway.write(state)
    return voided
  }
}

function calculateBalance(invoice: { readonly totalMinor: MoneyMinor } | undefined, payments: readonly Payment[]): { readonly remainingMinor: MoneyMinor; readonly status: InvoiceStatus } {
  if (!invoice) throw new Error('invoice not found')
  const paid = payments.filter((payment) => !payment.isVoid).reduce((total, payment) => total + (payment.amountMinor as number), 0)
  const remainingMinor = ((invoice.totalMinor as number) - paid) as MoneyMinor
  if (remainingMinor < 0) throw new Error('overpayment')
  return { remainingMinor, status: paid === 0 ? 'pending' : remainingMinor === 0 ? 'paid' : 'partially_paid' }
}

function updateInvoiceStatus(state: ReturnType<LocalStateGateway['read']>, invoiceId: InvoiceId, now: ISODateTime): void {
  const index = state.invoices.findIndex((invoice) => invoice.id === invoiceId)
  if (index < 0) throw new Error('invoice not found')
  const { status } = calculateBalance(state.invoices[index], state.payments.filter((payment) => payment.invoiceId === invoiceId))
  state.invoices[index] = { ...state.invoices[index], status, updatedAt: now }
}

function requireText(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error('void reason is required')
  return trimmed
}
