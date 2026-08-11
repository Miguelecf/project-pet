# Apply Progress: Local Demonstrable MVP

## M0.2 complete — surgical corrective gate

Six discoverable, reusable repository contract suites execute against test-only
in-memory fixtures. The fixtures use their repository maps as the single source
of truth: category references come from stored invoice lines; deletes remove the
stored category/daily-income; and void replaces the stored payment object. No
M0.3 adapter, UI, provider, auth, Supabase, or domain work was performed.

## Completed tasks

- [x] 0.2.1–0.2.6: Runtime-executed supplier, category, settings, invoice,
  payment, and daily-income contract suites.
- [x] 0.2.7–0.2.12: Six async per-module interfaces. Task 0.2.11 now correctly
  maps `PaymentRepository.getBalance()` with `findByInvoice`, `register`, and
  `void`.
- [x] 0.2.13: No `CrudRepository<T>` or `BaseRepository` exists.
- [x] M0.2 corrective gate: persisted mutation observations strengthened;
  M0.3 remains pending.

## TDD cycle evidence

All commands below ran from the repository root. “Not claimed” deliberately
means no failing run was observed for that behavior; it is not represented as a
RED cycle.

| Behavior / task | Test layer and safety net | RED evidence | GREEN evidence | REFACTOR evidence |
|---|---|---|---|---|
| Category reference (0.2.2) | Unit contract; prior focused baseline 12/12 | Historical gate RED: `npm run test:run -- src/test/contracts/repositoryContracts.test.ts` failed because the fixture had no real stored invoice-line reference. | Historical gate GREEN: same focused suite passed after `isReferenced()` derived its count from stored invoice lines. | Fixture retains one `lines` map; no reference set. |
| Category delete (0.2.2) | Unit contract; `npx vitest run src/test/contracts/repositoryContracts.test.ts` baseline: 12/12 | Corrective RED: same command, 3 failed / 9 passed after `delete()` stopped removing the map entry; category failed at `findById(...)` expected `null`, received category. | GREEN: same command 12/12 after restoring `categories.delete(id)`. | No refactor needed; map remains the sole category store. |
| Category post-delete list (0.2.2) | Unit contract; same 12/12 baseline | The corrective faulty delete state above was observed with the new list assertion written first; the first post-delete assertion stopped that test before its list assertion could execute, so a separate list-only RED is not claimed. | GREEN: same command 12/12; contract now asserts both `findById(id) === null` and `findAll()` excludes the id. | No refactor needed. |
| Settings defaults (0.2.3) | Unit contract; focused baseline 12/12 | Not claimed: no failing defaults state was observed in this correction. | `npx vitest run src/test/contracts/repositoryContracts.test.ts`: 12/12 verifies the complete deterministic settings object. | Existing `defaults()` factory retained. |
| Settings currency lock (0.2.3) | Unit contract; focused baseline 12/12 | Not claimed: no failing lock state was observed in this correction. | Same command 12/12 verifies USD→ARS after invoice and ARS→USD after daily income reject. | Existing map-backed financial-record check retained. |
| Invoice update (0.2.4) | Unit contract; focused baseline 12/12 | Not claimed: no failing update state was observed in this correction. | Same command 12/12 verifies persisted invoice/line update and active/deleted/restore queries. | No refactor needed. |
| Invoice errors (0.2.4) | Unit contract; focused baseline 12/12 | Historical RED: injected invoice write failed in the original contract run (2/12 failures). | Same focused command 12/12 verifies unknown read is null and adapter update error rejects. | One-shot `failNextInvoiceUpdate` remains test-only. |
| Payment partial/status (0.2.5) | Unit contract; focused baseline 12/12 | Not claimed: no failing partial/status state was observed in this correction. | Same command 12/12 verifies 600/1000 balance and persisted `partially_paid`, then paid and void-return status. | Shared balance/status helper remains synchronous and map-derived. |
| Payment overpay (0.2.5) | Unit contract; focused baseline 12/12 | Not claimed: no failing overpay state was observed in this correction. | Same command 12/12 verifies 401 after partial and 1001 before any payment reject. | No refactor needed. |
| Payment persisted void (0.2.5) | Unit contract; focused baseline 12/12 | Corrective RED: `npx vitest run src/test/contracts/repositoryContracts.test.ts`, 3 failed / 9 passed after `void()` returned a voided copy without storing it; `findByInvoice()` returned the active payment. | GREEN: same command 12/12 after `payments.set(id, voided)`; it asserts stored `isVoid`, reason, and date, plus balance/status. | No refactor needed; payment map is the sole payment store. |
| Daily-income delete (0.2.6) | Unit contract; focused baseline 12/12 | Corrective RED: same command, 3 failed / 9 passed after `delete()` stopped removing its map entry; `findById(...)` expected `null`, received updated income. | GREEN: same command 12/12 after restoring `incomes.delete(id)`; it asserts `findById` null and list exclusion. | No refactor needed; income map is the sole store. |
| Positive list/create/update/restore (0.2.1–0.2.6) | Unit contract; focused baseline 12/12 | Not claimed: no failing positive CRUD state was observed in this correction. | Same command 12/12 observes non-empty supplier/category/invoice/income lists, persisted updates, and invoice restore to active list. | No refactor needed. |

## Verification and size

- Focused six-suite harness (GREEN/REFACTOR): `npx vitest run
  src/test/contracts/repositoryContracts.test.ts` — 1 file, 12/12 passed.
- Required gates run after this correction: `npm run test:run`, `npm run
  test:coverage`, `npm run build`, `npm run lint`, and `git diff --check`.
- Cumulative M0.2 size measured from `b55d1c3` is 663 additions / 32 deletions:
  **631 net lines, 695 changed lines**. The approved 400→800 `size:exception`
  remains required and the cumulative change remains below 800 lines.

## Delivery boundary

- Strategy: one mainline corrective commit, approved 400→800 `size:exception`.
- Scope: M0.2 only; M0.3 adapters and all UI remain pending.
- Rollback: revert this corrective commit before any M0.3 consumer work.
