# Apply Progress: Local Demonstrable MVP

## Completed milestones

- [x] M0.2 — Async repository contracts and executable conformance suites.
- [x] M0.3a — LocalStateSchema, defensive atomic gateway, catalog local repositories, and persisted-envelope validation.
- [x] M0.3b — Invoice/payment/daily-income adapters, deterministic seed data, and restore.

## Completed tasks

- [x] 0.2.1–0.2.13: Async module contracts, reusable suites, and corrective conformance harness.
- [x] 0.3a.1–0.3a.10: Gateway coverage, complete state schema, supplier/category/settings adapters, shared local test fixtures, and persisted-envelope validation.
- [x] 0.3b.1–0.3b.11: Invoice/payment/daily-income adapters, deterministic seed data, atomic seed load/restore, and local contract verification.

## TDD cycle evidence

| Task | Test file | Layer | RED | GREEN | REFACTOR |
|---|---|---|---|---|---|
| 0.3b.1–0.3b.2 | `LocalInvoiceRepository.test.ts` | Unit | Missing module; 0 tests collected. | 2/2 passed. | Reused gateway state and retained active-payment edit guard. |
| 0.3b.3–0.3b.4 | `LocalPaymentRepository.test.ts` | Unit | Missing module; 0 tests collected. | 4/4 passed. | Centralized persisted balance/status derivation. |
| 0.3b.5–0.3b.6 | `LocalDailyIncomeRepository.test.ts` | Unit | Missing module; 0 tests collected. | 2/2 passed. | Preserved currency snapshot and descending reads. |
| 0.3b.7–0.3b.8 | `SeedData.test.ts` | Unit | Missing module; 0 tests collected. | 2/2 passed. | Inline deterministic fake data retained. |
| 0.3b.9–0.3b.10 | `LocalStateGateway.test.ts` | Unit | 2 tests failed: `loadSeed is not a function`. | 25/25 passed. | `loadSeed()` and `restore()` clone then use one validated atomic write. |
| 0.3b.11 | Focused local suite | Unit | N/A — verification-only task. | 35/35 passed. | Calendar mutant copies `SeedData.ts` with its isolated gateway copy. |

## Current verification

- Focused adapters/seed/gateway: 35/35 passed.
- Calendar mutant: 1/1 passed.
- `npm run test:run`: 83 passed, 1 skipped.
- `npm run test:coverage`: 83 passed, 1 skipped; statements 91.17%, branches 81.86%, functions 93.64%, lines 98.27%.
- `npm run build`, `npm run lint`, and `git diff --check`: passed.

## Scope and delivery

- M0.2, M0.3a, and M0.3b are complete; M1.1 is next.
- M0.3b changed 431 additions and 28 deletions: 459 changed lines, within its 800-line ceiling.
- No UI/provider/router, domain type, Supabase, or auth behavior was added by M0.3b.
- Delivery remains direct mainline milestone commits; no prior commit was amended or rewritten.
