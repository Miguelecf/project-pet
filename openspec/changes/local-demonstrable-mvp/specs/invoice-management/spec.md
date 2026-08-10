# Invoice Management Specification

## Purpose

Full invoice lifecycle: CRUD with line items, payment registration, payment voiding, safe delete with domain invariant #8, and restore capability.

## Requirements

### Requirement: Create Invoice with Lines

The system SHALL allow creating an invoice with a supplier reference, issue date, optional due date, and one or more line items. Issue date MUST be a valid ISO `YYYY-MM-DD` date no later than the injected clock's today; only due date MAY be future. Each line MUST have a category, description, positive finite `quantity` with at most three decimals, and non-negative safe-integer unit cost in minor units. The invoice total MUST sum individually half-up-rounded line totals. Persist `quantity`, never a `quantityMillis` domain field.

#### Scenario: Create invoice with valid lines

- GIVEN supplier "Acme" and category "Electronics" exist
- WHEN the user creates an invoice with 2 lines, due date 2026-09-01
- THEN the invoice is created with computed total and status "pending"

#### Scenario: Reject invoice with no lines

- GIVEN the create form is open
- WHEN the user submits with zero lines
- THEN the system rejects with a validation error

#### Scenario: Reject line with zero quantity

- GIVEN the line editor is open
- WHEN the user sets quantity to 0
- THEN the system rejects with a validation error

#### Scenario: Reject excessive quantity precision

- GIVEN the line editor is open
- WHEN the user sets quantity to 1.2345
- THEN the system rejects with a validation error

#### Scenario: Reject future issue date

- GIVEN the injected clock reports today as 2026-08-10
- WHEN the user submits issue date 2026-08-11
- THEN the system rejects with a validation error

#### Scenario: Reject line with negative unit cost

- GIVEN the line editor is open
- WHEN the user sets unit cost to -100
- THEN the system rejects with a validation error

### Requirement: Edit Invoice

The system SHALL allow editing invoice fields and lines. Editing MUST recompute totals. Editing MUST be blocked if the invoice has any non-voided payments.

#### Scenario: Edit invoice with no payments

- GIVEN an invoice with status "pending"
- WHEN the user edits the due date and saves
- THEN the invoice is updated

#### Scenario: Block edit when payments exist

- GIVEN an invoice with a non-voided payment
- WHEN the user attempts to edit
- THEN the system blocks editing with a message: "Void all payments before editing"

### Requirement: Register Payment (Invariant #4-#5)

The system SHALL allow registering a payment against an active invoice. Payment amount MUST be a positive safe integer in minor units. Payment date MUST be a valid ISO `YYYY-MM-DD` date no later than the injected clock's today. Payment MUST NOT exceed the remaining balance (totalMinor - sum of non-voided payments).

#### Scenario: Register full payment

- GIVEN invoice total is 10000 and no payments exist
- WHEN the user registers a payment of 10000
- THEN the payment is recorded and invoice status becomes "paid"

#### Scenario: Register partial payment

- GIVEN invoice total is 10000 and no payments exist
- WHEN the user registers a payment of 5000
- THEN the payment is recorded and invoice status becomes "partially_paid"

#### Scenario: Reject future payment date

- GIVEN the injected clock reports today as 2026-08-10
- WHEN the user submits payment date 2026-08-11
- THEN the system rejects with a validation error

#### Scenario: Reject overpayment

- GIVEN invoice total is 10000 and 8000 is already paid
- WHEN the user registers a payment of 3000
- THEN the system rejects: "Payment exceeds remaining balance (2000)"

#### Scenario: Reject zero payment

- GIVEN an invoice exists
- WHEN the user registers a payment of 0
- THEN the system rejects with a validation error

### Requirement: Void Payment (Invariant #6-#7)

The system SHALL allow voiding a payment. Voiding MUST mark the payment as voided (not delete it). Voided payments MUST NOT count toward the invoice's paid total. A confirmation dialog MUST precede voiding.

#### Scenario: Void a payment

- GIVEN an invoice with a non-voided payment of 5000
- WHEN the user confirms void
- THEN the payment is marked voided and invoice status recalculates

#### Scenario: Void restores balance availability

- GIVEN invoice total is 10000 with payment of 8000 (non-voided)
- WHEN the user voids the 8000 payment
- THEN the remaining balance becomes 10000 again

#### Scenario: Cancel void preserves payment

- GIVEN a payment exists
- WHEN the user cancels the void confirmation
- THEN the payment remains active

### Requirement: Safe Delete (Invariant #8)

The system MUST reject soft-delete or hard-delete of any invoice that has non-voided payments. All payments MUST be voided first. A clear error message MUST explain the requirement.

#### Scenario: Delete invoice with no payments

- GIVEN an invoice with status "pending" and no payments
- WHEN the user confirms deletion
- THEN the invoice is soft-deleted

#### Scenario: Block delete with non-voided payments

- GIVEN an invoice with 1 non-voided payment
- WHEN the user attempts deletion
- THEN the system rejects: "Cannot delete: void all payments first"

#### Scenario: Delete after voiding all payments

- GIVEN an invoice with 2 payments, both voided
- WHEN the user confirms deletion
- THEN the invoice is soft-deleted

### Requirement: Restore Deleted Invoice

The system SHALL keep a soft-deleted invoice and its lines in storage, exclude it from active queries and normal UI, expose it through an explicit deleted filter, and allow restore by clearing `deletedAt`.

#### Scenario: Restore soft-deleted invoice

- GIVEN a soft-deleted invoice
- WHEN the user triggers restore
- THEN the invoice reappears in the list with `deletedAt: null`

#### Scenario: Deleted filter lists retained invoice

- GIVEN an invoice has a non-null `deletedAt`
- WHEN the user selects the deleted filter
- THEN the retained invoice is listed with a restore action

### Requirement: Invoice List and Detail

The system SHALL display invoices in a list with status badges. Clicking an invoice MUST navigate to the detail page showing lines, payments, and totals.

#### Scenario: List shows status badges

- GIVEN invoices with statuses pending, partially_paid, and paid
- WHEN the invoice list page loads
- THEN each invoice shows its correct status badge

#### Scenario: Detail page shows full information

- GIVEN an invoice with 2 lines and 1 payment
- WHEN the user navigates to the detail page
- THEN lines, payment history, totals, and status are displayed

### Requirement: Invoice Routing

Invoice pages MUST use routes: `/invoices` (list), `/invoices/new` (create), `/invoices/:id` (detail), `/invoices/:id/edit` (edit). Navigation MUST use client-side routing.

#### Scenario: Navigate from list to detail

- GIVEN the invoice list shows an invoice
- WHEN the user clicks the invoice
- THEN the browser navigates to `/invoices/:id` and the detail page renders
