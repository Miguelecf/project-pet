# Apply Progress: Local Demonstrable MVP

## M0.2 and M0.3a complete — corrective gates

Six discoverable, reusable repository contract suites and a conformance harness
execute against test-only in-memory fixtures. The fixtures use repository maps
as the single source of truth: category references come from stored invoice
lines; deletes remove stored category/daily-income records; and void replaces
the stored payment object. The conformance tests use a 30-second per-test
  timeout because each deliberately launches a child Vitest process.

## Completed tasks

- [x] 0.2.1–0.2.6: Runtime-executed supplier, category, settings, invoice,
  payment, and daily-income contract suites.
- [x] 0.2.7–0.2.12: Six async per-module interfaces. Task 0.2.11 now correctly
  maps `PaymentRepository.getBalance()` with `findByInvoice`, `register`, and
  `void`.
- [x] 0.2.13: No `CrudRepository<T>` or `BaseRepository` exists.
- [x] M0.2 corrective gate: persisted mutation observations strengthened;
  reproducible conformance mutations now prove the four corrected behaviors;
  M0.3b remains pending.

## TDD cycle evidence

All commands below ran from the repository root. Historical entries are
explicitly reproduced conformance failures, not claims about an unavailable
historical timestamp. “Not claimed” deliberately means no failing run was
observed for that behavior; it is not represented as a RED cycle.

| Behavior / task | Test layer and safety net | RED evidence | GREEN evidence | REFACTOR evidence |
|---|---|---|---|---|
| Conformance timeout correction | Unit harness; baseline focused contracts 15/15, harness 5/5 | `npm run test:coverage` → 2 failed: child-process tests exceeded Vitest's 5000ms default. | Focused 20/20 and coverage 40 passed / 1 skipped with the 30-second per-test timeout. | Per-test only; assertions and mutants unchanged. |
| Category reference (0.2.2) | Unit contract; focused baseline 15/15 | Not claimed: no current or commit-pinned reproducer is retained for this historical category-reference claim. | Focused suite derives `isReferenced()` from stored invoice lines. | Fixture retains one `lines` map; no reference set. |
| Category hard-delete lookup (0.2.2) | Unit contract; safety net 15/15 | `CONTRACT_MUTANT=category-delete-retained npx vitest run src/test/contracts/repositoryContracts.mutant.test.ts` → 2 failed / 1 passed; lookup expected `null`, received stored category. | `npx vitest run src/test/contracts/repositoryContracts.test.ts` → 15/15 passed. | Map remains the sole category store. |
| Category post-delete list (0.2.2) | Unit contract; safety net 15/15 | Same command: `excludes an unreferenced category from the post-delete list` failed because the persisted category remained in `findAll()`. | Focused suite 15/15 and harness 5/5 pass. | Lookup and list are separate assertions, so both execute. |
| Settings defaults (0.2.3) | Unit contract; focused baseline 15/15 | Not claimed: no failing defaults state was observed in this correction. | `npx vitest run src/test/contracts/repositoryContracts.test.ts` → 15/15 verifies the complete deterministic settings object. | Existing `defaults()` factory retained. |
| Settings currency lock (0.2.3) | Unit contract; focused baseline 15/15 | Not claimed: no failing lock state was observed in this correction. | Same command → 15/15 verifies USD→ARS after invoice and ARS→USD after daily income reject. | Existing map-backed financial-record check retained. |
| Invoice update (0.2.4) | Unit contract; focused baseline 15/15 | Not claimed: no failing update state was observed in this correction. | Same command → 15/15 verifies persisted invoice/line update and active/deleted/restore queries. | No refactor needed. |
| Invoice errors (0.2.4) | Unit contract; focused baseline 15/15 | Not claimed: no current or commit-pinned reproducer is retained for the historical invoice-write failure. | Same command → 15/15 verifies unknown read is null and adapter update error rejects. | One-shot `failNextInvoiceUpdate` remains test-only. |
| Payment remaining-balance, overpayment, status (0.2.5) | Unit contract; safety net 15/15 | `CONTRACT_MUTANT=payment-balance-untracked npx vitest run src/test/contracts/repositoryContracts.mutant.test.ts` → 3 failed / 1 passed: 600/1000 returned 1000/pending and 401 resolved instead of rejecting. | Focused suite 15/15 verifies partial 400/`partially_paid`, complete 0/`paid`, and overpayment rejection; harness 5/5 confirms rejection. | Split transition and overpayment assertions to make both observable. |
| Payment persisted void (0.2.5) | Unit contract; safety net 15/15 | `CONTRACT_MUTANT=payment-void-unpersisted npx vitest run src/test/contracts/repositoryContracts.mutant.test.ts` → 1 failed / 3 passed; persisted lookup returned active payment. | Focused suite 15/15 verifies stored void fields, balance, and status; harness 5/5 passes. | Payment map is the sole payment store. |
| Daily-income hard-delete lookup (0.2.6) | Unit contract; safety net 15/15 | `CONTRACT_MUTANT=daily-income-delete-retained npx vitest run src/test/contracts/repositoryContracts.mutant.test.ts` → 1 failed / 1 passed; `findById` returned stored income. | Focused suite 15/15 verifies `findById` is null; harness 5/5 passes. | Income map is the sole store. |
| Positive list/create/update/restore (0.2.1–0.2.6) | Unit contract; focused baseline 15/15 | Not claimed: no failing positive CRUD state was observed in this correction. | Same command → 15/15 observes non-empty supplier/category/invoice/income lists, persisted updates, and invoice restore to active list. | No refactor needed. |

## Verification and size

- Focused six-suite harness (GREEN/REFACTOR): `npx vitest run
  src/test/contracts/repositoryContracts.test.ts` — 1 file, 15/15 passed.
- Conformance harness (GREEN/REFACTOR): `npx vitest run
  src/test/contracts/repositoryContractConformance.test.ts` — 1 file, 5/5
  passed; it runs each test-only mutation in a child Vitest process and requires
  the relevant shared contract assertion to fail.
- Required gates pass after this correction: `npm run test:run`, `npm run
  test:coverage`, `npm run build`, `npm run lint`, and `git diff --check`.
- Cumulative M0.2 size measured from `b55d1c3`: **724 additions / 33
  deletions; 691 net lines; 757 changed lines (churn)**. The approved 400→800
  `size:exception` remains required; cumulative M0.2 is 43 changed lines below
   the 800-line cap.

## M0.3a completion — persisted-domain validation correction

- [x] 0.3a.1–0.3a.10: versioned schema, atomic gateway, and catalog adapters.
- [x] Parseable malformed settings, supplier, category, invoice, invoice-line,
  payment, and daily-income records recover to `needs_seed`; a valid full
  envelope remains `ready`.
- [ ] M0.3b: invoice/payment/daily-income adapters, seed data, and restore.

### TDD cycle evidence

This is reproduced current conformance evidence, not unavailable historical
execution history. Safety net: `npx vitest run
src/infrastructure/local/LocalStateGateway.test.ts` → 9/9 passed before the
new cases.

| Behavior | RED command/output | GREEN command/output | REFACTOR |
|---|---|---|---|
| Settings currency | Gateway command → 7 failed / 9 passed; malformed record was `ready`. | Gateway command → 16/16 passed; empty/`needs_seed`. | Predicate extracted. |
| Supplier required field | Same RED → `ready`. | Same GREEN → empty/`needs_seed`. | Predicate extracted. |
| Category timestamp | Same RED → `ready`. | Same GREEN → empty/`needs_seed`. | Predicate extracted. |
| Invoice supplier ID | Same RED → `ready`. | Same GREEN → empty/`needs_seed`. | Relationship predicate extracted. |
| Invoice-line category ID | Same RED → `ready`. | Same GREEN → empty/`needs_seed`. | Relationship predicate extracted. |
| Payment union | Same RED → `ready`. | Same GREEN → empty/`needs_seed`. | Union predicate extracted. |
| Daily-income future date | Same RED → `ready`. | Same GREEN → empty/`needs_seed`. | Date predicate extracted. |
| Existing M0.3a gateway guarantees | Safety net above → 9/9 passed. | Gateway command → 16/16 passed; missing/malformed/version mismatch, clone, one `setItem`, failed write, and invalid candidate remain covered. | Existing atomic write path retained. |

Verification: focused local gateway/adapters 23/23; `npm run test:run` and
`npm run test:coverage` 63 passed / 1 skipped; build, lint, and `git diff
--check` passed. Cumulative M0.3a diff from `cefedc1` is 689 changed lines,
leaving 111 of 800.

## Delivery boundary

- Strategy: one mainline corrective commit, approved 400→800 `size:exception`.
- Scope: M0.2 and M0.3a only; M0.3b adapters/seed/restore and all UI remain pending.
- Rollback: revert this corrective commit before any M0.3 consumer work.
