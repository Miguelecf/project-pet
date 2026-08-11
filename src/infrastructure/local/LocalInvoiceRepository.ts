import type { ISODateTime, Invoice, InvoiceId, InvoiceLine, InvoiceLineId, InvoiceStatus, MoneyMinor } from '../../types/domain'
import type { CreateInvoiceInput, InvoiceRepository, InvoiceWithLines, UpdateInvoiceInput } from '../../modules/invoices/InvoiceRepository'
import { LocalStateGateway } from './LocalStateGateway'

interface LocalInvoiceRepositoryOptions {
  readonly now?: () => ISODateTime
  readonly nextInvoiceId?: () => InvoiceId
  readonly nextLineId?: () => InvoiceLineId
}

export class LocalInvoiceRepository implements InvoiceRepository {
  private readonly gateway: LocalStateGateway
  private readonly now: () => ISODateTime
  private readonly nextInvoiceId: () => InvoiceId
  private readonly nextLineId: () => InvoiceLineId

  constructor(gateway: LocalStateGateway, options: LocalInvoiceRepositoryOptions = {}) {
    this.gateway = gateway
    this.now = options.now ?? (() => new Date().toISOString() as ISODateTime)
    this.nextInvoiceId = options.nextInvoiceId ?? (() => crypto.randomUUID() as InvoiceId)
    this.nextLineId = options.nextLineId ?? (() => crypto.randomUUID() as InvoiceLineId)
  }

  async findAll(): Promise<readonly Invoice[]> { return this.gateway.read().invoices.filter((invoice) => invoice.deletedAt === null) }
  async findById(id: InvoiceId): Promise<InvoiceWithLines | null> {
    const state = this.gateway.read()
    const invoice = state.invoices.find((item) => item.id === id)
    return invoice ? { invoice, lines: state.invoiceLines.filter((line) => line.invoiceId === id) } : null
  }
  async findByStatus(status: InvoiceStatus): Promise<readonly Invoice[]> { return (await this.findAll()).filter((invoice) => invoice.status === status) }
  async findDeleted(): Promise<readonly Invoice[]> { return this.gateway.read().invoices.filter((invoice) => invoice.deletedAt !== null) }

  async create(input: CreateInvoiceInput): Promise<InvoiceWithLines> { return this.save(this.nextInvoiceId(), input) }
  async update(id: InvoiceId, input: UpdateInvoiceInput): Promise<InvoiceWithLines> {
    if (!(await this.findById(id))) throw new Error('invoice not found')
    if (this.gateway.read().payments.some((payment) => payment.invoiceId === id && !payment.isVoid)) throw new Error('Void all payments before editing')
    return this.save(id, input)
  }
  async softDelete(id: InvoiceId): Promise<void> {
    const state = this.gateway.read()
    const index = state.invoices.findIndex((invoice) => invoice.id === id)
    if (index < 0) throw new Error('invoice not found')
    if (state.payments.some((payment) => payment.invoiceId === id && !payment.isVoid)) throw new Error('Cannot delete: void all payments first')
    state.invoices[index] = { ...state.invoices[index], deletedAt: this.now(), updatedAt: this.now() }
    await this.gateway.write(state)
  }
  async restore(id: InvoiceId): Promise<Invoice> {
    const state = this.gateway.read()
    const index = state.invoices.findIndex((invoice) => invoice.id === id)
    if (index < 0) throw new Error('invoice not found')
    const invoice = { ...state.invoices[index], deletedAt: null, updatedAt: this.now() }
    state.invoices[index] = invoice
    await this.gateway.write(state)
    return invoice
  }

  private async save(id: InvoiceId, input: CreateInvoiceInput): Promise<InvoiceWithLines> {
    const state = this.gateway.read()
    const existing = state.invoices.find((invoice) => invoice.id === id)
    if (!state.suppliers.some((supplier) => supplier.id === input.supplierId)) throw new Error('supplier not found')
    if (input.lines.length === 0) throw new Error('invoice requires at least one line')
    const timestamp = this.now()
    const lines: InvoiceLine[] = input.lines.map((line, index) => {
      if (!state.categories.some((category) => category.id === line.categoryId)) throw new Error('category not found')
      const lineTotalMinor = Math.round((line.quantity as number) * (line.unitCostMinor as number)) as MoneyMinor
      return { ...line, id: this.nextLineId(), invoiceId: id, lineTotalMinor, position: (index + 1) as never, createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp }
    })
    const totalMinor = lines.reduce((total, line) => total + (line.lineTotalMinor as number), 0) as MoneyMinor
    const invoice: Invoice = { id, ...input, totalMinor, status: existing?.status ?? 'pending', deletedAt: existing?.deletedAt ?? null, createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp }
    if (existing) {
      state.invoices[state.invoices.findIndex((item) => item.id === id)] = invoice
      state.invoiceLines = state.invoiceLines.filter((line) => line.invoiceId !== id)
    } else state.invoices.push(invoice)
    state.invoiceLines.push(...lines)
    await this.gateway.write(state)
    return { invoice, lines }
  }
}
