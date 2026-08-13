# Demo Seed Specification

## Purpose

Provide deterministic inline seed data for the local demonstrable MVP, a restore/reset mechanism, and a guided demo walkthrough document.

## Requirements

### Requirement: Deterministic Seed Data Constant

The system SHALL export an inline TypeScript constant `SEED_DATA` with a `SEED_DATA_VERSION` field. The constant MUST contain: 2 suppliers, 6 categories, 3 invoices (one `pending`, one `partially_paid`, one `paid`), 2 daily incomes, and 1 overdue invoice. All values MUST be obviously fake (no real names, round amounts).

#### Scenario: Seed data structure is complete

- GIVEN the `SEED_DATA` constant
- WHEN inspecting its contents
- THEN it contains exactly 2 suppliers, 6 categories, 3 invoices, 2 daily incomes, and 1 overdue invoice

#### Scenario: Seed data uses fake values

- GIVEN the `SEED_DATA` constant
- WHEN inspecting supplier names and amounts
- THEN names are like "Demo Supplier A" and amounts are round numbers (e.g., 10000, 5000)

#### Scenario: Seed data version is present

- GIVEN the `SEED_DATA` constant
- WHEN inspecting its fields
- THEN `SEED_DATA_VERSION` is a positive integer

### Requirement: Seed Data Coverage

Seed data MUST exercise all demo paths: a `pending` invoice (no payments), a `partially_paid` invoice (one payment < total), a `paid` invoice (payment = total), an overdue invoice (past due date), and daily incomes spanning multiple non-future days.

#### Scenario: Pending invoice in seed

- GIVEN the seed data
- WHEN inspecting invoices
- THEN one invoice has no payments and status "pending"

#### Scenario: Partial invoice in seed

- GIVEN the seed data
- WHEN inspecting invoices
- THEN one invoice has one payment less than total and status "partially_paid"

#### Scenario: Paid invoice in seed

- GIVEN the seed data
- WHEN inspecting invoices
- THEN one invoice has payment equal to total and status "paid"

#### Scenario: Overdue invoice in seed

- GIVEN the seed data
- WHEN inspecting invoices
- THEN one invoice has a due date in the past

### Requirement: Restore/Reset Action

The system SHALL provide a user-accessible restore action (button or menu item) that resets all data to `SEED_DATA`. A confirmation dialog MUST precede the reset.
The action MUST invoke `RepositoryProvider.restore()`, publish a revision so active
repository consumers refresh, and expose visible success or retryable error feedback.
It MUST describe only local demo data and MUST NOT disclose credentials, storage keys,
or other implementation secrets.

#### Scenario: Restore resets all data

- GIVEN the user has modified data extensively
- WHEN the user confirms restore
- THEN all data matches `SEED_DATA` exactly

#### Scenario: Restore requires confirmation

- GIVEN the user clicks the restore button
- WHEN the confirmation dialog appears
- THEN the user MUST click "Confirm" to proceed or "Cancel" to abort

#### Scenario: Restore feedback is accessible and retryable

- GIVEN a user confirms the restore action
- WHEN the provider restore succeeds
- THEN a visible success status confirms that demo data was restored and consumers refresh
- WHEN the provider restore fails
- THEN an accessible error and retry action are visible without exposing internal details

#### Scenario: Cancel restore preserves data

- GIVEN the user clicks restore
- WHEN the user clicks "Cancel" in the confirmation dialog
- THEN no data is changed

### Requirement: Demo Walkthrough Document

The system SHALL include `docs/demo-script.md` — a guided product-owner walkthrough that covers: open app → see seeded dashboard → navigate catalogs → create invoice → register partial payment → complete payment → void payment → record daily income → verify dashboard → restore demo data. The document MUST NOT contain code.

#### Scenario: Demo script covers full lifecycle

- GIVEN `docs/demo-script.md` exists
- WHEN reading the document
- THEN it includes steps for every action in the demo path

#### Scenario: Demo script has no code

- GIVEN `docs/demo-script.md` exists
- WHEN inspecting the content
- THEN no code blocks or implementation details are present

### Requirement: Seed Data Immutability

`SEED_DATA` MUST be treated as read-only at runtime. No application code SHALL mutate the seed constant. Restore MUST write a deep copy, not a reference.

#### Scenario: Seed constant not mutated after restore

- GIVEN `loadSeed()` has been called
- WHEN inspecting the `SEED_DATA` constant
- THEN it remains identical to its original definition
