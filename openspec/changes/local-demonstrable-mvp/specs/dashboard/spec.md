# Dashboard Specification

## Purpose

Provide a deterministic local operational dashboard without changing repository,
domain, Supabase, or auth boundaries.

## Requirements

### Requirement: Period and Calendar Semantics

The dashboard MUST offer `day`, `week`, and `month`, defaulting to `month`.
Against injected local `today`, day is `[today,today]`, week is the containing
Monday–Sunday, and month is first–last calendar date, all inclusive. ISO
`YYYY-MM-DD` values MUST be compared as calendar dates without UTC conversion.

#### Scenario: Boundary inclusion
- GIVEN today is 2026-08-12
- WHEN week is selected
- THEN records dated 2026-08-10 through 2026-08-16 inclusive qualify

### Requirement: Financial Metrics

Period income MUST equal daily-income amounts whose `saleDate` is in the period.
Paid expenses MUST equal non-voided payment amounts whose `paymentDate` is in the
period and whose invoice is active. Estimated cash result MUST equal period income
minus paid expenses and MUST state “Estimated cash result — not net profit”. Total
outstanding MUST equal active invoice totals minus all non-voided payments,
independent of the period. Status counts MUST derive from each active invoice's
total and all non-voided payments, not from a stored status shortcut. Every sum and
subtraction MUST remain a safe integer in the invoice currency or fail visibly.

#### Scenario: Four numbers reconcile
- GIVEN one period income, one paid active invoice, and one unpaid active invoice
- WHEN the dashboard loads
- THEN income, paid expenses, cash result, and outstanding match the formulas

#### Scenario: Deleted and voided records
- GIVEN deleted invoices and voided payments exist
- WHEN metrics are calculated
- THEN deleted invoices/their payments and voided payments contribute zero

### Requirement: Weekly Income Summary

The dashboard MUST always show the injected current Monday–Sunday, with each
day’s income sum or zero; changing the period MUST NOT change this summary.

#### Scenario: Sparse week
- GIVEN income exists only Monday and Wednesday
- WHEN the dashboard loads
- THEN those totals and zero for the other five days are shown

### Requirement: Latest Invoices and Inactivity

The dashboard MUST show at most 10 active invoices ordered by `issueDate`
descending then `createdAt` descending then ID ascending, regardless of period.
Each row MUST link to detail and show reference, issue date, derived status, total,
and outstanding. It MUST show inactivity when no daily income exists in the seven
inclusive dates `[today-6,today]`, including when no income exists.

#### Scenario: Deterministic latest ten
- GIVEN 12 active invoices including equal issue dates and one deleted invoice
- WHEN the dashboard loads
- THEN exactly the first 10 by the tie-break order are shown and deleted is absent

#### Scenario: Inactivity threshold
- GIVEN today is 2026-08-12
- WHEN no income is dated 2026-08-06 through 2026-08-12 inclusive
- THEN an inactivity alert is shown
- AND income on either boundary suppresses it

### Requirement: Numeric Category Breakdown

For each qualifying payment, paid expense MUST be allocated proportionally across
its active invoice’s rounded line totals. Each share is floored; residual minor
units MUST go by line `position`, then line ID. Shares MUST aggregate by category,
sort amount descending then category name/ID, and reconcile exactly to paid
expenses. A zero-total invoice contributes no category amount.

#### Scenario: Remainder allocation
- GIVEN a 100-minor payment covers three equal line totals
- WHEN category amounts are calculated
- THEN shares are 34, 33, and 33 by deterministic line order

### Requirement: Empty, Routing, and Accessibility

Zero financial data MUST render labeled zero metrics, seven zero week days, empty
latest/category states, inactivity, and a seed-data prompt. The full dashboard
MUST be the `/` landing page. Controls, metrics, alerts, lists, disclosure, and
status text MUST be keyboard and screen-reader accessible; color MUST NOT carry
meaning alone. Existing `DueAlerts` MUST remain, using configured `dueAlertDays`.

#### Scenario: Empty root dashboard
- GIVEN no financial records exist
- WHEN `/` loads
- THEN all defined empty states and accessible labels are rendered
