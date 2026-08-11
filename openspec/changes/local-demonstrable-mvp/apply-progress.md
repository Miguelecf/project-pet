# Apply Progress: Local Demonstrable MVP

## M0.2 complete — corrective gate

Async, module-specific repository contracts and reusable, runtime-executed adapter
contract suites are ready for local adapter implementation in M0.3a. This
corrective pass makes adapter conformance observable from persisted repository
state: category references arise from real invoice lines, settings defaults are
complete and deterministic, payments update persisted invoice status, and CRUD
lists prove mutations are not no-ops. No production adapter, UI, or M0.3 behavior
was implemented.

## Completed tasks

- [x] 0.2.1–0.2.6: Added and runtime-executed reusable supplier, category,
  settings, invoice, payment, and daily-income contract suites against test-only
  in-memory fixtures.
- [x] 0.2.7–0.2.12: Added the six async, per-module repository interfaces.
- [x] 0.2.13: Confirmed there is no `CrudRepository<T>` or `BaseRepository`.
- [x] M0.2 corrective gate: strengthened all six discoverable contract suites
  without advancing M0.3.

## TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 0.2.1–0.2.6 original corrective | `repositoryContracts.test.ts` | Unit contract | 20/20 baseline | Missing fixture import failed (0 tests); injected invoice write failed (2/12) | 12/12 contracts passed | CRUD plus duplicate/reference/lock/update/overpayment paths | Test-only fixture extracted; no production adapter |
| 0.2.1–0.2.6 gate corrective | Six `*RepositoryContract.ts` files | Unit contract | 12/12 focused baseline | Category real-reference fixture and persisted payment invoice lookup failed (2/12) after tests were written first | 12/12 focused contracts passed after the minimal fixture/interface changes | Non-empty lists, updates, delete/restore lists, both ARS↔USD locks, partial/exact/void payment balance and status | Extracted synchronous payment-balance/status helper; status is persisted on the invoice and independently asserted |
| 0.2.1–0.2.6 original | Six `*RepositoryContract.ts` files | Unit contract | N/A (new) | `npm run build` failed: missing interfaces | Interfaces added; build passed | Original structural coverage | Corrected by executable runtime suite |
| 0.2.7–0.2.12 | Repository interfaces | Type-level | N/A (new) | Covered by the six missing-module compile failures | `npm run build` passed | Skipped: structural declarations | Names and module boundaries reviewed |
| 0.2.13 | Repository contract tree | Static inspection | N/A (new) | N/A | `CrudRepository|BaseRepository` search returned no matches | Skipped: one structural outcome | Interface segregation retained |

## Command evidence

- RED: `npm run build` exited non-zero because all six repository modules were
  absent (`TS2307`).
- GREEN: `npm run build` passed after the contracts were added.
- Corrective RED: `npm run test:run -- src/test/contracts/repositoryContracts.test.ts`
  failed because the test-only fixture module did not exist.
- Corrective GREEN: the focused contract suite passed 12 tests after adding the
  fixture and strengthening the contracts.
- Gate corrective RED: `npm run test:run -- src/test/contracts/repositoryContracts.test.ts`
  failed with two failures after the new assertions were written: no real category
  invoice-line reference fixture and no persisted invoice lookup in payment state.
- Gate corrective GREEN: the focused contract suite passed all 12 tests after the
  fixture created a real invoice line and `PaymentRepository.getBalance()` plus
  persisted invoice status were implemented in the test adapter.
- Final verification: focused contracts, `npm run test:run`, coverage, build,
  lint, and `git diff --check` are recorded after this corrective commit.
- Diff: measured from the M0.2 base `b55d1c3`, the cumulative M0.2 diff is 628
  additions and 32 deletions: **596 net lines** (660 changed lines). This
  corrective work unit is 114 additions and 41 deletions: **73 net lines** (155
  changed lines). The approved `size:exception` raises the review budget from
  400 to 800 because the cumulative net diff exceeds 400; it is required, not
  unnecessary.

## Delivery boundary

- Strategy: single mainline corrective commit using the approved 400→800
  `size:exception`.
- Scope: M0.2 only; M0.3 adapters and all UI remain pending.
- Rollback: revert this milestone before any adapter or consumer milestone.
