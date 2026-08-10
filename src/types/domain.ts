/**
 * Local MVP domain contracts.
 *
 * Financial invariants:
 * 1. Money is stored as integer minor units (cents), never floating-point major units.
 * 2. A line total is explicitly rounded to two decimals before it contributes to an invoice total.
 * 3. An invoice total is the sum of its already-rounded line totals.
 * 4. Quantity is positive and supports at most three decimal places.
 * 5. Invoice status is derived from non-voided payments; it is never edited directly.
 * 6. Non-voided payments cannot exceed the invoice total.
 * 7. Payments are immutable after creation except for the one-way void transition.
 * 8. An invoice with non-voided payments cannot be soft- or hard-deleted.
 * 9. Every invoice has at least one line and every line owns its expense category.
 * 10. A non-empty document reference is unique per active supplier, case-insensitively.
 * 11. There is one daily cash closure per calendar date.
 * 12. Only due dates may be in the future; issue, payment, and cash-closure dates may not.
 * 13. The business currency cannot change after financial records exist; no conversion is performed.
 * 14. Credit-card payments affect the operational result on their recorded payment date.
 *
 * These contracts are independent from React, Supabase, and localStorage. Runtime constructors,
 * validation, calculations, and repository enforcement belong to subsequent backlog activities.
 */

declare const domainBrand: unique symbol;

export type Brand<Value, Name extends string> = Value & {
  readonly [domainBrand]: Name;
};

export type SupplierId = Brand<string, 'SupplierId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;
export type InvoiceLineId = Brand<string, 'InvoiceLineId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type DailyIncomeId = Brand<string, 'DailyIncomeId'>;

/** Calendar date in strict YYYY-MM-DD format. */
export type ISODate = Brand<string, 'ISODate'>;

/** UTC instant in ISO 8601 format. */
export type ISODateTime = Brand<string, 'ISODateTime'>;

/**
 * String guaranteed to contain non-whitespace content after runtime validation.
 * Runtime constructors and validators must trim values and reject empty ones;
 * that enforcement belongs to a later backlog activity.
 */
export type NonEmptyString = Brand<string, 'NonEmptyString'>;

/** Integer amount in the currency's minor unit (for example, cents). */
export type MoneyMinor = Brand<number, 'MoneyMinor'>;

/** Positive quantity with a maximum of three decimal places. */
export type Quantity = Brand<number, 'Quantity'>;

export type PositiveInteger = Brand<number, 'PositiveInteger'>;
export type NonNegativeInteger = Brand<number, 'NonNegativeInteger'>;

export type Currency = 'ARS' | 'USD';

export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid';

export type PaymentMethod =
  | 'bank_transfer'
  | 'cash'
  | 'debit_card'
  | 'credit_card'
  | 'digital_wallet';

export interface EntityTimestamps {
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface Settings extends EntityTimestamps {
  readonly currency: Currency;
  readonly dueAlertDays: NonNegativeInteger;
}

export interface Supplier extends EntityTimestamps {
  readonly id: SupplierId;
  readonly name: string;
  /** Trimmed, case-folded value used to enforce uniqueness. */
  readonly normalizedName: string;
  readonly defaultDueDays: PositiveInteger | null;
  readonly deletedAt: ISODateTime | null;
}

export interface Category extends EntityTimestamps {
  readonly id: CategoryId;
  readonly name: string;
  /** Trimmed, case-folded value used to enforce uniqueness. */
  readonly normalizedName: string;
}

export interface Invoice extends EntityTimestamps {
  readonly id: InvoiceId;
  readonly supplierId: SupplierId;
  readonly docRef: string | null;
  readonly issueDate: ISODate;
  readonly dueDate: ISODate | null;
  /** Snapshot of the business currency at creation time. */
  readonly currency: Currency;
  readonly totalMinor: MoneyMinor;
  /** Derived from the invoice total and its non-voided payments. */
  readonly status: InvoiceStatus;
  readonly notes: string | null;
  readonly deletedAt: ISODateTime | null;
}

export interface InvoiceLine extends EntityTimestamps {
  readonly id: InvoiceLineId;
  readonly invoiceId: InvoiceId;
  readonly categoryId: CategoryId;
  readonly productRef: string;
  readonly externalSku: string | null;
  readonly description: string;
  readonly quantity: Quantity;
  readonly unitCostMinor: MoneyMinor;
  readonly lineTotalMinor: MoneyMinor;
  readonly position: PositiveInteger;
}

interface PaymentBase {
  readonly id: PaymentId;
  readonly invoiceId: InvoiceId;
  readonly amountMinor: MoneyMinor;
  readonly paymentDate: ISODate;
  readonly method: PaymentMethod;
  /** Optional shared reference when one real transfer is split across invoices. */
  readonly reference: string | null;
  readonly notes: string | null;
  readonly createdAt: ISODateTime;
}

export interface ActivePayment extends PaymentBase {
  readonly isVoid: false;
  readonly voidedAt: null;
  readonly voidReason: null;
}

export interface VoidedPayment extends PaymentBase {
  readonly isVoid: true;
  readonly voidedAt: ISODateTime;
  readonly voidReason: NonEmptyString;
}

/** A discriminated union makes an invalid partial void state unrepresentable. */
export type Payment = ActivePayment | VoidedPayment;

export interface DailyIncome extends EntityTimestamps {
  readonly id: DailyIncomeId;
  readonly saleDate: ISODate;
  readonly amountMinor: MoneyMinor;
  /** Snapshot used to keep historical records unambiguous. */
  readonly currency: Currency;
  readonly note: string | null;
}
