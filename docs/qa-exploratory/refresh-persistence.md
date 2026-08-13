# Refresh persistence exploratory QA

This unexecuted session sheet verifies that local demo data survives a real browser refresh across available modules.

## Session record

| Field | Value |
| --- | --- |
| Date | 2026-08-12 (planned; update when executed) |
| Build | Not executed — record local build identifier before testing |
| Commit | Not executed — record checked-out commit before testing |
| Owner | Unassigned |
| Status | Planned |
| Result | Not executed |

## Objective

Verify that successful local mutations remain after refresh in suppliers, categories, settings, invoices, payments, daily income, and dashboard views.

## Setup

1. Start the local demo in one supported desktop browser tab.
2. Use fake data only and record browser, build, commit, and seeded state.
3. Keep the tab open until checks finish; restore demo data afterward.

## Checks

1. Create a uniquely named supplier, refresh, and confirm it remains in Suppliers.
2. Create a uniquely named category, refresh, and confirm it remains in Categories.
3. Change only due-alert days, save, refresh, and confirm the saved value remains.
4. Create an invoice with one valid line, refresh, and confirm detail, total, and pending status remain.
5. Register a partial payment, refresh, and confirm payment history, balance, and partially paid status remain.
6. Create daily income for today, refresh, and confirm the list entry and applicable dashboard metric remain.
7. Use Restore demo data, refresh, and confirm temporary records are removed and deterministic seed data returns.

## Expected results

- Each successful mutation survives refresh without duplicates, lost values, or crashes.
- Derived invoice and dashboard values remain consistent with persisted records.
- Restore replaces exploratory changes with deterministic fake data.

## Evidence and findings

| Check | Evidence link or note | Actual result | Finding ID |
| --- | --- | --- | --- |
| Environment |  | Not executed |  |
| Supplier |  | Not executed |  |
| Category |  | Not executed |  |
| Settings |  | Not executed |  |
| Invoice and payment |  | Not executed |  |
| Daily income and dashboard |  | Not executed |  |
| Restore |  | Not executed |  |

## Severity tracking

| Finding ID | Severity | Description | Owner | Status | Resolution or acceptance |
| --- | --- | --- | --- | --- | --- |
|  | BLOCKER | Prevents the session or demo from continuing |  | Open |  |
|  | CRITICAL | Data loss, crash, or unusable core demo flow |  | Open |  |
|  | MAJOR | Materially degrades a required workflow |  | Open |  |
|  | MINOR | Cosmetic or limited usability issue |  | Open |  |
|  | SUGGESTION | Improvement with no observed defect |  | Open |  |

## Acceptance gate

Pass only when there are zero BLOCKER/CRITICAL findings and every MAJOR finding is resolved or explicitly accepted.
