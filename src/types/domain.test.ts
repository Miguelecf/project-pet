import { describe, expectTypeOf, it } from 'vitest'
import type {
  ActivePayment,
  Category,
  CategoryId,
  Currency,
  DailyIncome,
  DailyIncomeId,
  Invoice,
  InvoiceId,
  InvoiceLine,
  InvoiceLineId,
  InvoiceStatus,
  ISODateTime,
  NonEmptyString,
  Payment,
  PaymentId,
  PaymentMethod,
  Supplier,
  SupplierId,
  VoidedPayment,
} from './domain'

type HasCategory<T> = 'categoryId' extends keyof T ? true : false
type PartialVoidPayment = Omit<ActivePayment, 'isVoid' | 'voidedAt' | 'voidReason'> & {
  readonly isVoid: true
  readonly voidedAt: null
  readonly voidReason: null
}

describe('domain type contracts', () => {
  it('keeps invoice status and payment method unions exact', () => {
    expectTypeOf<InvoiceStatus>().toEqualTypeOf<'pending' | 'partially_paid' | 'paid'>()
    expectTypeOf<Currency>().toEqualTypeOf<'ARS' | 'USD'>()
    expectTypeOf<PaymentMethod>().toEqualTypeOf<
      'bank_transfer' | 'cash' | 'debit_card' | 'credit_card' | 'digital_wallet'
    >()
  })

  it('assigns categories to invoice lines, not invoices', () => {
    expectTypeOf<HasCategory<InvoiceLine>>().toEqualTypeOf<true>()
    expectTypeOf<HasCategory<Invoice>>().toEqualTypeOf<false>()
    expectTypeOf<InvoiceLine['categoryId']>().toEqualTypeOf<CategoryId>()
  })

  it('models active and voided payments as complete discriminated states', () => {
    expectTypeOf<Payment>().toEqualTypeOf<ActivePayment | VoidedPayment>()
    expectTypeOf<Extract<Payment, { isVoid: false }>>().toEqualTypeOf<ActivePayment>()
    expectTypeOf<Extract<Payment, { isVoid: true }>>().toEqualTypeOf<VoidedPayment>()
    expectTypeOf<ActivePayment['voidedAt']>().toEqualTypeOf<null>()
    expectTypeOf<ActivePayment['voidReason']>().toEqualTypeOf<null>()
    expectTypeOf<VoidedPayment['voidedAt']>().toEqualTypeOf<ISODateTime>()
    expectTypeOf<VoidedPayment['voidReason']>().toEqualTypeOf<NonEmptyString>()
    expectTypeOf<PartialVoidPayment>().not.toMatchTypeOf<Payment>()
    expectTypeOf<string>().not.toMatchTypeOf<NonEmptyString>()
  })

  it('uses branded identifiers for core entities and relationships', () => {
    expectTypeOf<Supplier['id']>().toEqualTypeOf<SupplierId>()
    expectTypeOf<Category['id']>().toEqualTypeOf<CategoryId>()
    expectTypeOf<Invoice['id']>().toEqualTypeOf<InvoiceId>()
    expectTypeOf<Invoice['supplierId']>().toEqualTypeOf<SupplierId>()
    expectTypeOf<InvoiceLine['id']>().toEqualTypeOf<InvoiceLineId>()
    expectTypeOf<InvoiceLine['invoiceId']>().toEqualTypeOf<InvoiceId>()
    expectTypeOf<Payment['id']>().toEqualTypeOf<PaymentId>()
    expectTypeOf<Payment['invoiceId']>().toEqualTypeOf<InvoiceId>()
    expectTypeOf<DailyIncome['id']>().toEqualTypeOf<DailyIncomeId>()
    expectTypeOf<string>().not.toMatchTypeOf<SupplierId>()
    expectTypeOf<string>().not.toMatchTypeOf<InvoiceId>()
    expectTypeOf<string>().not.toMatchTypeOf<PaymentId>()
  })
})
