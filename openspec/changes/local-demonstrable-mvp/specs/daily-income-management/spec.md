# Daily Income Management Specification

## Purpose

Provide persistent daily-income CRUD for the local demo and refresh dashboard income metrics after every successful mutation.

## Requirements

### Requirement: Create Daily Income

The system SHALL create a `DailyIncome` with generated ID, `saleDate`, positive safe-integer `amountMinor`, current Settings currency snapshot, nullable trimmed `note`, and timestamps. `saleDate` MUST be a valid ISO `YYYY-MM-DD` date no later than the injected clock's today. The repository MUST reject a second daily income for the same sale date.

#### Scenario: Create valid income

- GIVEN Settings currency is `ARS` and the injected clock reports 2026-08-10
- WHEN the user records 25000 minor units for 2026-08-10 with an optional note
- THEN the record persists with currency `ARS` and the dashboard refreshes

#### Scenario: Reject invalid amount or future date

- GIVEN the create form is open on 2026-08-10
- WHEN amount is zero/negative or sale date is 2026-08-11
- THEN creation is rejected before persistence

#### Scenario: Reject duplicate sale date

- GIVEN a daily income already exists for 2026-08-10
- WHEN the user creates another record for 2026-08-10
- THEN creation is rejected before persistence

### Requirement: List Daily Incomes

The system SHALL list persisted daily incomes in descending sale-date order and show an accessible empty state when none exist.

#### Scenario: List persisted records

- GIVEN two daily incomes exist on different dates
- WHEN `/daily-income` loads
- THEN both records appear newest first with amount, currency, date, note, edit, and delete controls

### Requirement: Edit Daily Income

The system SHALL edit `saleDate`, positive `amountMinor`, and nullable note while preserving ID, currency snapshot, and `createdAt`; it MUST update `updatedAt` and enforce the same non-future-date and unique-sale-date validations.

#### Scenario: Edit updates dashboard

- GIVEN a persisted daily income
- WHEN the user saves a valid changed amount
- THEN storage and dashboard monthly/weekly totals reflect the new amount

### Requirement: Delete Daily Income

The system SHALL hard-delete a daily income only after confirmation and SHALL leave state unchanged when canceled.

#### Scenario: Confirm delete

- GIVEN a persisted daily income
- WHEN the user confirms deletion
- THEN it is absent from storage/list and dashboard totals recalculate

#### Scenario: Cancel delete

- GIVEN the confirmation dialog is open
- WHEN the user cancels
- THEN the record and dashboard totals remain unchanged

### Requirement: Persistence and Routing

Daily-income mutations MUST use `DailyIncomeRepository` and the atomic local gateway; UI code MUST NOT access `localStorage`. List/create/edit UI MUST be reachable through `/daily-income`, `/daily-income/new`, and `/daily-income/:id/edit`.

#### Scenario: Record survives remount

- GIVEN a valid daily income was created
- WHEN the app remounts against the same localStorage origin
- THEN the repository returns the record and the dashboard includes it
