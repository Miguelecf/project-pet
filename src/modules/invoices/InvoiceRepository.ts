import type {
  CategoryId,
  Currency,
  Invoice,
  InvoiceId,
  InvoiceLine,
  InvoiceStatus,
  ISODate,
  MoneyMinor,
  Quantity,
  SupplierId,
} from '../../types/domain'

export interface InvoiceLineInput {
  readonly categoryId: CategoryId
  readonly productRef: string
  readonly externalSku: string | null
  readonly description: string
  readonly quantity: Quantity
  readonly unitCostMinor: MoneyMinor
}

export interface CreateInvoiceInput {
  readonly supplierId: SupplierId
  readonly docRef: string | null
  readonly issueDate: ISODate
  readonly dueDate: ISODate | null
  readonly currency: Currency
  readonly notes: string | null
  readonly lines: readonly InvoiceLineInput[]
}

export interface UpdateInvoiceInput extends CreateInvoiceInput {}

export interface InvoiceWithLines {
  readonly invoice: Invoice
  readonly lines: readonly InvoiceLine[]
}

export interface InvoiceRepository {
  findAll(): Promise<readonly Invoice[]>
  findById(id: InvoiceId): Promise<InvoiceWithLines | null>
  findByStatus(status: InvoiceStatus): Promise<readonly Invoice[]>
  findDeleted(): Promise<readonly Invoice[]>
  create(input: CreateInvoiceInput): Promise<InvoiceWithLines>
  update(id: InvoiceId, input: UpdateInvoiceInput): Promise<InvoiceWithLines>
  softDelete(id: InvoiceId): Promise<void>
  restore(id: InvoiceId): Promise<Invoice>
}
