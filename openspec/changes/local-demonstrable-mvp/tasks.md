# Tasks: Local Demonstrable MVP (M0.2 → GMVP)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~5800–6400 across ~24 milestone commits |
| Largest milestone | M4.2 ~750 lines |
| 800-line budget risk | Medium — M4.2 is near the guard and must split if it grows |
| Chained PRs recommended | No — single mainline delivery, no PRs |
| Delivery strategy | single mainline delivery (no PR); milestone commits |
| Chain strategy | none |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none
800-line budget risk: Medium

## Conventions

- **TDD**: every behavior follows RED (failing test) → GREEN (make pass) → REFACTOR (clean up) within the same milestone. No GREEN production code is written before a failing test exists for that behavior.
- **Commit**: one conventional commit per milestone on `main`. Tests + code + docs + terminal-todo update in same commit.
- **Format**: `feat(<scope>): <action> — <milestone-id>`. Body lists key behaviors.
- **Gate**: run `npm run test:run` green before commit. Run `npm run build && npm run lint` at gate milestones.
- **Preserved**: `src/types/domain.ts`, `src/types/domain.test.ts`, `src/lib/supabase/`, `openspec/changes/admin-managed-email-auth/` — read-only, never modified.

## Rollback Order (reverse dependency)

Revert in this exact order: GMVP → Q5 → Q4 → Q3 → Q2 → M4.3 → M4.2 → M4.1 → G3-LOCAL → M3.6 → M3.5 → M3.4 → M3.3 → M3.2 → M3.1 → G2-LOCAL → M2.3 → M2.2 → M2.1 → M1.2 → M1.1 → M0.3b → M0.3a → M0.2.

**Milestones are NOT independently revertible.** Each depends on all prior milestones. Rollback is dependency-aware: revert consumers before providers so the codebase remains compile-safe at every step. Clear an incompatible newer storage key or restore through the compatible gateway before reverting persistence. Never revert a provider while consumers still import it.

---

## M0.2 — Async Per-Module Repository Contracts (~400 lines)

**Commit**: `feat(contracts): define async per-module repository interfaces and contract test suites — M0.2`
**Specs**: `repository-contracts` (all requirements)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 0.2.1 RED: Write contract test `src/test/contracts/supplierRepositoryContract.ts` — exports `describeSupplierRepositoryContract(adapter)` with CRUD, uniqueness, soft-delete, list-excludes-deleted assertions.
- [x] 0.2.2 RED: Write contract test `src/test/contracts/categoryRepositoryContract.ts` — CRUD, uniqueness, block-delete-if-referenced assertions.
- [x] 0.2.3 RED: Write contract test `src/test/contracts/settingsRepositoryContract.ts` — get/save, currency-lock, defaults assertions.
- [x] 0.2.4 RED: Write contract test `src/test/contracts/invoiceRepositoryContract.ts` — CRUD with lines, status filter, soft-delete/restore, deleted-filter assertions.
- [x] 0.2.5 RED: Write contract test `src/test/contracts/paymentRepositoryContract.ts` — register, void, overpayment reject, balance recalc assertions.
- [x] 0.2.6 RED: Write contract test `src/test/contracts/dailyIncomeRepositoryContract.ts` — CRUD and unique sale-date assertions. Provider revision/dashboard refresh remains M2.1/M4.1.
- [x] 0.2.7 GREEN: Create `src/modules/suppliers/SupplierRepository.ts` — async interface with `findAll`, `findById`, `create`, `update`, `softDelete`.
- [x] 0.2.8 GREEN: Create `src/modules/categories/CategoryRepository.ts` — async interface with `findAll`, `findById`, `create`, `update`, `delete`, `isReferenced`.
- [x] 0.2.9 GREEN: Create `src/modules/settings/SettingsRepository.ts` — async interface with `get`, `save` only (no CRUD symmetry).
- [x] 0.2.10 GREEN: Create `src/modules/invoices/InvoiceRepository.ts` — async interface with `findAll`, `findById`, `findByStatus`, `findDeleted`, `create`, `update`, `softDelete`, `restore`.
- [x] 0.2.11 GREEN: Create `src/modules/invoices/PaymentRepository.ts` — async interface with `findByInvoice`, `getBalance`, `register`, `void`.
- [x] 0.2.12 GREEN: Create `src/modules/daily-income/DailyIncomeRepository.ts` — async interface with `findAll`, `findById`, `create`, `update`, `delete`.
- [x] 0.2.13 REFACTOR: Verify no `CrudRepository<T>` or `BaseRepository` exists. Confirm interface segregation per spec.

**Corrective gate record:** all M0.2 contract tasks remain complete. The
discoverable suites additionally prove real category invoice-line references,
complete deterministic Settings defaults, persisted payment balance/status, and
observable CRUD/list/delete/restore behavior. The discoverable conformance
harness reproduces failures for persisted payment void, daily-income hard-delete
lookup, category post-delete list, and payment balance/overpayment/status; its
child-process tests have a per-test timeout so coverage is deterministic.
M0.3a, M0.3b, M1.1, M1.2, M2.1, M2.2, M2.3, G2-LOCAL, M3.1, M3.2, M3.3, and M3.4 are complete; M3.5 is next.

## M0.3a — Local Persistence Core + Settings/Suppliers/Categories Repos (~500 lines)

**Commit**: `feat(persistence): versioned LocalStateSchema, defensive gateway, and catalog local repos — M0.3a`
**Specs**: `local-persistence` (versioned key, defensive parse, write atomicity), `repository-contracts` (contract tests pass against local adapter for suppliers/categories/settings)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 0.3a.1 RED: Write `src/infrastructure/local/LocalStateGateway.test.ts` — test versioned key read, missing/malformed/mismatched degrades to empty, single `setItem` per write, failed write rejects without publishing.
- [x] 0.3a.2 GREEN: Create `src/infrastructure/local/LocalStateSchema.ts` — `SCHEMA_VERSION = 1`, storage key `project-pet-v1`, full envelope type.
- [x] 0.3a.3 GREEN: Create `src/infrastructure/local/LocalStateGateway.ts` — `read()` with defensive parse, `write(envelope)` with clone-validate + single `setItem`, recovery type `'ready' | 'needs_seed' | 'unavailable'`.
- [x] 0.3a.4 RED: Write `src/infrastructure/local/LocalSupplierRepository.test.ts` — run `describeSupplierRepositoryContract` against local adapter.
- [x] 0.3a.5 GREEN: Create `src/infrastructure/local/LocalSupplierRepository.ts` — implements `SupplierRepository` via gateway.
- [x] 0.3a.6 RED: Write `src/infrastructure/local/LocalCategoryRepository.test.ts` — run `describeCategoryRepositoryContract` against local adapter.
- [x] 0.3a.7 GREEN: Create `src/infrastructure/local/LocalCategoryRepository.ts` — implements `CategoryRepository` via gateway.
- [x] 0.3a.8 RED: Write `src/infrastructure/local/LocalSettingsRepository.test.ts` — run `describeSettingsRepositoryContract` against local adapter.
- [x] 0.3a.9 GREEN: Create `src/infrastructure/local/LocalSettingsRepository.ts` — implements `SettingsRepository` via gateway.
- [x] 0.3a.10 REFACTOR: Extract shared gateway test helpers if duplicated.

## M0.3b — Invoice/Payment/DailyIncome Repos + Seed + Restore (~620 lines)

**Commit**: `feat(persistence): local invoice/payment/daily-income repos, seed data, and restore — M0.3b`
**Specs**: `local-persistence` (seed loading, restore), `demo-seed` (seed constant, immutability), `repository-contracts` (remaining contract tests pass)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 0.3b.1 RED: Write `src/infrastructure/local/LocalInvoiceRepository.test.ts` — run `describeInvoiceRepositoryContract`.
- [x] 0.3b.2 GREEN: Create `src/infrastructure/local/LocalInvoiceRepository.ts` — implements `InvoiceRepository` via gateway.
- [x] 0.3b.3 RED: Write `src/infrastructure/local/LocalPaymentRepository.test.ts` — run `describePaymentRepositoryContract`.
- [x] 0.3b.4 GREEN: Create `src/infrastructure/local/LocalPaymentRepository.ts` — implements `PaymentRepository` via gateway.
- [x] 0.3b.5 RED: Write `src/infrastructure/local/LocalDailyIncomeRepository.test.ts` — run `describeDailyIncomeRepositoryContract`.
- [x] 0.3b.6 GREEN: Create `src/infrastructure/local/LocalDailyIncomeRepository.ts` — implements `DailyIncomeRepository` via gateway.
- [x] 0.3b.7 RED: Write `src/infrastructure/local/SeedData.test.ts` — verify structure (2 suppliers, 6 categories, 3 invoices, 2 daily incomes, 1 overdue), fake values, `SEED_DATA_VERSION`, immutability after restore.
- [x] 0.3b.8 GREEN: Create `src/infrastructure/local/SeedData.ts` — inline `SEED_DATA` constant with `SEED_DATA_VERSION`, deep-copy on restore.
- [x] 0.3b.9 RED: Extend `LocalStateGateway.test.ts` — `loadSeed()` writes seed envelope atomically, `restore()` produces independent deep-copy, subsequent mutations do not affect stored seed.
- [x] 0.3b.10 GREEN: Add `loadSeed()` and `restore()` to `LocalStateGateway` — deep-copy seed, atomic write.
- [x] 0.3b.11 REFACTOR: Verify contract tests all pass. Confirm seed immutability.

## M1.1 — App Shell: Router + Layout + Sidebar (~260 lines)

**Commit**: `feat(shell): BrowserRouter, Layout, Sidebar navigation — M1.1`
**Specs**: `app-shell` (BrowserRouter route map, Layout with Sidebar)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 1.1.1 RED: Write `src/app/AppRouter.test.tsx` — verify `/` renders Dashboard placeholder, `/suppliers` renders supplier page, unknown route redirects to `/`.
- [x] 1.1.2 GREEN: Create `src/app/AppRouter.tsx` — `BrowserRouter` with route map: `/`, `/suppliers/*`, `/categories/*`, `/invoices/*`, `/daily-income/*`, `/settings`, catch-all redirect.
- [x] 1.1.3 RED: Write `src/app/Layout.test.tsx` — verify sidebar renders nav links, skip-link targets `#main-content`.
- [x] 1.1.4 GREEN: Create `src/app/Layout.tsx` — sidebar + main content region with `#main-content` id.
- [x] 1.1.5 RED: Write `src/app/Sidebar.test.tsx` — verify all module links present, responsive collapse at <768px, hamburger toggle.
- [x] 1.1.6 GREEN: Create `src/app/Sidebar.tsx` — nav links, responsive collapse, hamburger toggle.
- [x] 1.1.7 GREEN: Update `src/main.tsx` — mount `AppRouter`. Update `src/App.tsx` — render `Layout`. _(Pure wiring — no new behavior; covered by 1.1.1–1.1.6 tests.)_
- [x] 1.1.8 REFACTOR: Verify route navigation tests pass.

## M1.2 — App Shell: Overlays + ConfirmDialog + A11y (~250 lines)

**Commit**: `feat(shell): StateOverlay, ConfirmDialog, skip-link, focus management — M1.2`
**Specs**: `app-shell` (StateOverlay, ConfirmDialog, skip-link, focus management)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 1.2.1 RED: Write `src/components/StateOverlay.test.tsx` — loading shows spinner + inert content, error shows retry button, empty shows create prompt.
- [x] 1.2.2 GREEN: Create `src/components/StateOverlay.tsx` — loading/error/empty states, dismissible error, non-dismissible loading.
- [x] 1.2.3 RED: Write `src/components/ConfirmDialog.test.tsx` — confirm calls `onConfirm`, Escape calls `onCancel`, focus trapped, focus restored to trigger on close.
- [x] 1.2.4 GREEN: Create `src/components/ConfirmDialog.tsx` — focus trap, Escape handler, trigger focus restore.
- [x] 1.2.5 RED: Write focus-management test — route change moves focus to page `h1`.
- [x] 1.2.6 GREEN: Add focus-to-heading logic in `Layout` on route change.
- [x] 1.2.7 REFACTOR: Verify skip-link visible on focus, jumps to `#main-content`.

## M2.1 — Supplier CRUD + Soft Delete (~430 lines)

**Commit**: `feat(suppliers): CRUD pages with soft-delete and uniqueness — M2.1`
**Specs**: `supplier-management` (all requirements)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 2.1.1 RED: Write `src/app/RepositoryProvider.test.tsx` — provides repositories to children, revision counter increments after successful atomic mutation, `restore()` resets state and refetches.
- [x] 2.1.2 GREEN: Create `src/app/RepositoryProvider.tsx` — provides repositories + revision counter + `restore()`. Increment revision after successful atomic mutation.
- [x] 2.1.3 GREEN: Create `src/app/useRepositories.ts` — context hook returning `RepositoryProviderValue`. _(Trivial `useContext` wrapper; behavior tested via RepositoryProvider.)_
- [x] 2.1.4 RED: Write `src/modules/suppliers/useSuppliers.test.ts` — loading/error/data states, calls `SupplierRepository` methods, refetches on revision change.
- [x] 2.1.5 GREEN: Create `src/modules/suppliers/useSuppliers.ts` — hook wrapping repository calls with loading/error state.
- [x] 2.1.6 RED: Write `src/modules/suppliers/SupplierPage.test.tsx` — list excludes deleted, empty-state prompt, navigate to edit.
- [x] 2.1.7 GREEN: Create `src/modules/suppliers/SupplierPage.tsx` — list page with edit/delete actions, `StateOverlay` integration.
- [x] 2.1.8 RED: Write `src/modules/suppliers/SupplierForm.test.tsx` — create valid, reject duplicate normalized name, reject empty, edit succeeds, soft-delete with confirm dialog.
- [x] 2.1.9 GREEN: Create `src/modules/suppliers/SupplierForm.tsx` — create/edit form, `ConfirmDialog` for delete.
- [x] 2.1.10 REFACTOR: Verify all supplier scenarios pass.

## M2.2 — Category CRUD + Block-Delete (~240 lines)

**Commit**: `feat(categories): CRUD pages with block-delete protection — M2.2`
**Specs**: `category-management` (all requirements)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 2.2.1 RED: Write `src/modules/categories/useCategories.test.ts` — loading/error/data states, calls `CategoryRepository` methods, refetches on revision change.
- [x] 2.2.2 GREEN: Create `src/modules/categories/useCategories.ts` — hook.
- [x] 2.2.3 RED: Write `src/modules/categories/CategoryPage.test.tsx` — list all, empty prompt, block-delete referenced category with count message.
- [x] 2.2.4 GREEN: Create `src/modules/categories/CategoryPage.tsx` — list with delete protection.
- [x] 2.2.5 RED: Write `src/modules/categories/CategoryForm.test.tsx` — create valid, reject duplicate, reject empty, edit unique.
- [x] 2.2.6 GREEN: Create `src/modules/categories/CategoryForm.tsx` — create/edit form.
- [x] 2.2.7 REFACTOR: Verify block-delete shows reference count.

## M2.3 — Settings CRUD + Currency-Lock (~240 lines)

**Commit**: `feat(settings): CRUD page with currency-lock enforcement — M2.3`
**Specs**: `settings-management` (all requirements)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 2.3.1 RED: Write `src/modules/settings/useSettings.test.ts` — loads settings, saves changes, exposes currency-lock check against invoices and daily incomes.
- [x] 2.3.2 GREEN: Create `src/modules/settings/useSettings.ts` — hook.
- [x] 2.3.3 RED: Write `src/modules/settings/SettingsPage.test.tsx` — read defaults, save with no records, reject currency change with invoices, reject with daily incomes, allow dueAlertDays change.
- [x] 2.3.4 GREEN: Create `src/modules/settings/SettingsPage.tsx` — settings form with currency/dueAlertDays.
- [x] 2.3.5 RED: Write `src/modules/settings/SettingsForm.test.tsx` — currency-lock error message references both record types.
- [x] 2.3.6 GREEN: Create `src/modules/settings/SettingsForm.tsx` — form with validation and error display.
- [x] 2.3.7 REFACTOR: Verify currency-lock checks both invoices and daily incomes.

## G2-LOCAL — Catalog Gate (~100 lines)

**Commit**: `test(catalogs): close reachable branch coverage gate — G2-LOCAL`
**Specs**: `quality-gates` (G2-LOCAL scenario)
**Gate**: `npm run test:coverage` shows >=90% reachable branch coverage in each supplier, category, and settings module. Retain unreachable defensive guards; do not alter product behavior to execute invalid internal states. `npm run test:run && npm run build && npm run lint` green. Update `docs/terminal-todo.md`.
**TDD note**: RED/GREEN not applicable — this milestone adds only tests to close coverage gaps on already-implemented code.

- [x] G2.1 Review coverage report for suppliers, categories, settings modules; document reachable >=90% per-module policy and retained unreachable guards.
- [x] G2.2 Add meaningful reachable branch-coverage tests for error, retry, cancellation, navigation, and mutation paths without product changes.
- [x] G2.3 Confirm catalog-focused tests, `npm run test:run`, `npm run test:coverage`, `npm run build`, `npm run lint`, and `git diff --check` all exit 0.

**Completion evidence:** suppliers 94.44%, categories 96.87%, and settings 95.45% branch coverage. M2.3 and G2-LOCAL are complete; M3.1 is next and remains unstarted.

## M3.1 — Pure Financial Rules (~350 lines)

**Commit**: `feat(finance): pure financial functions — lineTotalMinor, invoiceTotals, deriveStatus, rounding — M3.1`
**Specs**: `financial-rules` (all requirements)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 3.1.1 RED: Write `src/utils/finance.test.ts` — table-driven tests: `lineTotalMinor(3, 1500)=4500`, `lineTotalMinor(1.255, 100)=126`, `lineTotalMinor(10000, 5)=50000`, reject invalid quantity, 0.005 rounding, large-qty precision, deterministic 100× call.
- [x] 3.1.2 GREEN: Create `src/utils/finance.ts` — `lineTotalMinor`, `invoiceTotals`, `deriveStatus`, `roundHalfUp`. Thousandths normalization, safe-integer guards, half-up rounding.
- [x] 3.1.3 RED: Write `src/utils/finance.test.ts` — `invoiceTotals` multi-line sum=8000, empty=0. `deriveStatus` pending/partial/paid, reject overpayment.
- [x] 3.1.4 GREEN: Implement `invoiceTotals` and `deriveStatus` in `finance.ts`.
- [x] 3.1.5 RED: Write `src/utils/dates.test.ts` — validate ISO date format, reject future dates for issue/payment/sale, allow future due date.
- [x] 3.1.6 GREEN: Create `src/utils/dates.ts` — `validateISODate`, `isFuture`, `Clock` interface.
- [x] 3.1.7 RED: Write `src/utils/validation.test.ts` — positive finite ≤3 decimals, non-negative safe integer, trimmed non-empty string.
- [x] 3.1.8 GREEN: Create `src/utils/validation.ts` — `validateQuantity`, `validateMoneyMinor`, `validateNonEmpty`.
- [x] 3.1.9 REFACTOR: Verify all financial edge cases pass. Confirm pure function contract (no I/O).

## M3.2 — Invoice Create/Edit Form + Line Editor (~500 lines)

**Commit**: `feat(invoices): invoice create/edit form with line editor — M3.2`
**Specs**: `invoice-management` (create invoice with lines, edit invoice)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 3.2.1 RED: Write `src/modules/invoices/useInvoices.test.tsx` — invoice loading/error states and revision refetch.
- [x] 3.2.2 GREEN: Create `src/modules/invoices/useInvoices.ts` — revision-aware hook wrapping `InvoiceRepository`.
- [x] 3.2.3 RED: Write `src/modules/invoices/InvoiceForm.test.tsx` — valid create, accessible no-line/quantity/date/cost rejection, edit, and active-payment block.
- [x] 3.2.4 GREEN: Create `src/modules/invoices/InvoiceForm.tsx` — create/edit form with real provider catalogs, date validation, and line editor integration.
- [x] 3.2.5 RED: Write `src/modules/invoices/InvoiceLineEditor.test.tsx` — add/remove, category, validation, and finance-total scenarios.
- [x] 3.2.6 GREEN: Create `src/modules/invoices/InvoiceLineEditor.tsx` — dynamic, accessible lines calculated by pure finance utilities.
- [x] 3.2.7 REFACTOR: Verify editing disables all invoice controls when non-voided payments exist.

## M3.3 — Invoice List/Detail Pages (~350 lines)

**Commit**: `feat(invoices): list and detail pages with status badges — M3.3`
**Specs**: `invoice-management` (invoice list and detail, invoice routing)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 3.3.1 RED: Write `src/modules/invoices/InvoiceListPage.test.tsx` — list shows status badges, navigate to detail, empty-state prompt.
- [x] 3.3.2 GREEN: Create `src/modules/invoices/InvoiceListPage.tsx` — list with status badges, links to detail.
- [x] 3.3.3 RED: Write `src/modules/invoices/InvoiceDetailPage.test.tsx` — shows lines, payments, totals, status. Edit link when no payments.
- [x] 3.3.4 GREEN: Create `src/modules/invoices/InvoiceDetailPage.tsx` — full detail view.
- [x] 3.3.5 REFACTOR: Verify routing `/invoices`, `/invoices/new`, `/invoices/:id`, `/invoices/:id/edit`.

## M3.4 — Payment Form + Void (~490 lines)

**Commit**: `feat(invoices): payment registration and void with invariants #4-#7 — M3.4`
**Specs**: `invoice-management` (register payment, void payment)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 3.4.1 RED: Write `src/modules/invoices/usePayments.test.ts` — register payment calls repository, void calls repository, balance recalculation, loading/error states, refetches on revision change.
- [x] 3.4.2 GREEN: Create `src/modules/invoices/usePayments.ts` — hook.
- [x] 3.4.3 RED: Write `src/modules/invoices/PaymentForm.test.tsx` — full payment → paid, partial → partially_paid, real load error → production retry recovery, reject future date, reject overpayment with remaining balance message, reject zero, void with confirm, void restores balance, cancel void preserves.
- [x] 3.4.4 GREEN: Create `src/modules/invoices/PaymentForm.tsx` — payment form with amount/date/method, semantic load-retry button, void button with `ConfirmDialog`.
- [x] 3.4.5 GREEN: Integrate `PaymentForm` into `InvoiceDetailPage`. _(Wiring — behavior tested via PaymentForm and InvoiceDetailPage tests.)_
- [x] 3.4.6 REFACTOR: Verify all payment invariant scenarios pass.

## M3.5 — Safe Delete + Restore (~250 lines)

**Commit**: `feat(invoices): safe delete/restore with invariant #8 — M3.5`
**Specs**: `invoice-management` (safe delete, restore deleted invoice)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 3.5.1 RED: Write safe-delete tests — delete with no payments succeeds, block delete with non-voided payments, delete after voiding all succeeds.
- [x] 3.5.2 GREEN: Add soft-delete/restore actions to `InvoiceDetailPage` and `InvoiceListPage` with `ConfirmDialog`.
- [x] 3.5.3 RED: Write restore/deleted-filter tests — restore clears `deletedAt`, deleted filter shows retained invoices.
- [x] 3.5.4 GREEN: Add deleted-filter toggle and restore action to list page.
- [x] 3.5.5 REFACTOR: Verify invariant #8 across all delete paths.

## M3.6 — Due-Date Alert Widget (~250 lines)

**Commit**: `feat(dashboard): due-date alert widget on dashboard — M3.6`
**Specs**: `dashboard` (due-date alert widget)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 3.6.1 RED: Write `src/modules/dashboard/DueAlerts.test.tsx` — overdue shows red badge, due-soon within 7 days, no alerts message, exactly-7-days boundary.
- [x] 3.6.2 GREEN: Create `src/modules/dashboard/DueAlerts.tsx` — widget with overdue/due-soon badges, semantic list, accessible labels.
- [x] 3.6.3 GREEN: Integrate `DueAlerts` into dashboard placeholder. _(Wiring — widget behavior tested in 3.6.1; full dashboard integration tested in M4.2.)_
- [x] 3.6.4 REFACTOR: Verify color is not the only indicator (text badge required).

## G3-LOCAL — Core Gate (~100 lines)

**Commit**: `test(core): close reachable branch coverage gate — G3-LOCAL`
**Specs**: `quality-gates` (G3-LOCAL scenario)
**Gate**: `npm run test:coverage` shows >=90% reachable branch coverage per core module: invoice UI/core and local invoice, payment, and daily-income adapters. Retain defensive guards unreachable through valid public UI states or requiring manually malformed persisted internals; do not alter product behavior or force-test impossible states. `npm run test:run && npm run build && npm run lint` green. Update `docs/terminal-todo.md`.
**TDD note**: RED/GREEN not applicable — this milestone adds only tests to close coverage gaps on already-implemented code.

- [x] G3.1 Review coverage report for invoices, payments, daily-income modules. Coverage review on 2026-08-12: `src/modules/invoices` 76.08%; `LocalInvoiceRepository.ts` 91.30%; `LocalPaymentRepository.ts` 88.23%; `LocalDailyIncomeRepository.ts` 88.23% branch coverage.
- [x] G3.2 Add meaningful reachable branch-coverage tests for edge cases and error paths without production changes or invalid-state injection.
- [x] G3.3 Confirm `npm run test:run && npm run build && npm run lint` all exit 0. `npm run test:coverage` and `git diff --check` also exited 0 on 2026-08-12; all covered core modules meet the approved >=90% reachable target.

**Completion evidence:** invoice UI/core **96.73%** (178/184), `LocalInvoiceRepository` **100%** (39/39), `LocalPaymentRepository` **91.30%** (21/23), and `LocalDailyIncomeRepository` **100%** (17/17) V8 branch coverage. The remaining guards are defensive-only: they require impossible public UI states, non-`Error` failures from internal validators, or manually malformed persisted internals. G3-LOCAL is complete; M4.1 is next.

## M4.1 — Daily Income CRUD (~390 lines)

**Commit**: `feat(daily-income): CRUD pages with dashboard refresh — M4.1`
**Specs**: `daily-income-management` (all requirements)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 4.1.1 RED: Write `src/modules/daily-income/useDailyIncomes.test.ts` — CRUD operations via `DailyIncomeRepository`, loading/error states, triggers dashboard-relevant revision after mutation.
- [x] 4.1.2 GREEN: Create `src/modules/daily-income/useDailyIncomes.ts` — hook.
- [x] 4.1.3 RED: Write `src/modules/daily-income/DailyIncomePage.test.tsx` — list descending, empty state, create valid, reject zero/future/duplicate date, edit updates dashboard, confirm/cancel delete.
- [x] 4.1.4 GREEN: Create `src/modules/daily-income/DailyIncomePage.tsx` — list page with create/edit/delete actions.
- [x] 4.1.5 RED: Write `src/modules/daily-income/DailyIncomeForm.test.tsx` — form validation, currency snapshot display, note field.
- [x] 4.1.6 GREEN: Create `src/modules/daily-income/DailyIncomeForm.tsx` — create/edit form.
- [x] 4.1.7 REFACTOR: Verify dashboard totals refresh after every mutation.

## M4.2 — Full Dashboard (~750 lines)

**Commit**: `feat(dashboard): complete local operational dashboard — M4.2`
**Specs**: `dashboard` (all requirements; existing DueAlerts remains complete)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.

- [x] 4.2.1 RED: Add `dashboardAggregates.test.ts` for local day/week/month inclusive boundaries, four formulas, active status counts, current-week summary, deleted/void exclusions, and safe integers.
- [x] 4.2.2 GREEN: Add `dashboardAggregates.ts` pure date ranges and aggregate functions; outstanding/status remain all-time while income/payment/result use the selected period.
- [x] 4.2.3 RED: Cover proportional paid-expense category allocation, deterministic remainder/tie sorting, zero-total invoices, latest-10 tie order, and seven-date inactivity threshold.
- [x] 4.2.4 GREEN: Complete pure category/latest/inactivity selectors without changing domain or repository contracts.
- [x] 4.2.5 RED: Add `DashboardPage.test.tsx` for provider loading/error/retry, period interaction, reconciliation/disclosure, weekly zeros, latest links, categories, inactivity, empty/seed prompt, revision refresh, DueAlerts, and semantic labels.
- [x] 4.2.6 GREEN: Create `DashboardPage.tsx`; read only existing repositories, inject local clock, and render all dashboard sections/accessibility states.
- [x] 4.2.7 GREEN: Replace root placeholder in `src/App.tsx`/`src/app/AppRouter.tsx` with the full `/` dashboard and retain shell focus behavior.
- [x] 4.2.8 REFACTOR: Run focused/full/coverage/build/lint/diff gates; update progress/TODO/plan. Split before commit if the milestone exceeds 800 changed lines.

## M4.3 — Demo Script Document (~150 lines)

**Commit**: `docs(demo): guided walkthrough script — M4.3`
**Specs**: `demo-seed` (demo walkthrough document)
**Gate**: First deliver the restore-demo-data prerequisite, then verify `docs/demo-script.md` covers full lifecycle with no code blocks. Update `docs/terminal-todo.md`.

- [x] 4.3.0 RED/GREEN/REFACTOR: Add a semantic `Restore demo data` dashboard control using `ConfirmDialog` and `RepositoryProvider.restore()`; cancel preserves data, confirmation restores the deterministic seed and refreshes by provider revision, and generic success/error/retry feedback is accessible without exposing implementation secrets.

- [x] 4.3.1 Create `docs/demo-script.md` — step-by-step walkthrough: open app → seeded dashboard → catalogs → create invoice → partial payment → complete payment → void payment → daily income → verify dashboard → restore.
- [x] 4.3.2 Verify document contains no code blocks or implementation details.

**Completion evidence:** `docs/demo-script.md` is an English, client-facing
walkthrough covering local-demo disclosure, deterministic fake data, full lifecycle,
dashboard interpretation, visible restore confirmation, recovery, expected results,
and client validation questions. Content checks confirm required headings and steps,
with no fenced code blocks or implementation details. M4.3 is complete; Q2 is next.

## Q2 — Domain Coverage: Edge-Case Tests (~300 lines)

**Commit**: `test(domain): edge-case coverage for financial rules and domain types — Q2`
**Specs**: `quality-gates` (edge-case tests on financial rules)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.
**TDD note**: RED/GREEN not applicable — this milestone adds only tests to close coverage gaps on already-implemented code.

- [x] Q2.1 Verify dedicated edge-case coverage: `roundHalfUp(0.005)`, `roundHalfUp(1.005)`, `lineTotalMinor(10000, 5)`, zero/negative quantity, negative money, and >3-decimal quantity rejection. Existing focused cases were retained without duplicates.
- [x] Q2.2 Verify overpayment detection in both `deriveStatus` and local payment registration, including partial/exact status transitions and overpayment before/after a partial payment. Existing focused cases were retained without duplicates.
- [x] Q2.3 Add the missing branded primitive contract assertions (`ISODate`, `MoneyMinor`, `Quantity`); retain existing exact currency/status unions and strict runtime ISO-date format tests.

**Completion evidence:** Q2 is test-only. The financial suite already covered the
requested 0.005/1.005 half-up cases, large quantity/small cost, zero/negative and
precision rejections, and status overpayment. Payment contract tests already prove
registration rejects overpayment before and after partial payment and preserves
pending/partial/paid transitions. Q2 adds only the previously missing compile-time
separation assertions for date, money, and quantity brands; no production behavior
changed. Q2 introduced no skipped or disabled tests; the one intentional
pre-existing `it.skip` remains at
`src/test/contracts/repositoryContracts.mutant.test.ts:13` for the mutation
harness. Commit `d324f31` churn is 88 changed lines (79 additions, 9 deletions),
within the 800-line milestone guard. Q3 is next.

## Q3 — Integration Tests (~400 lines)

**Commit**: `test(integration): multi-step flows, state conservation, corrupt recovery — Q3`
**Specs**: `quality-gates` (integration tests)
**Gate**: `npm run test:run` green. Update `docs/terminal-todo.md`.
**TDD note**: RED/GREEN not applicable — this milestone adds only integration tests exercising already-implemented code.

- [x] Q3.1 Create `src/integration/invoiceLifecycle.test.tsx` — full lifecycle: create → partial payment → full payment → void → delete → verify deleted filter and restore.
- [x] Q3.2 Create `src/integration/persistenceRecovery.test.tsx` — invalid JSON and parseable malformed localStorage degrade to the dashboard empty/seed prompt; sequential mutations conserve state.
- [x] Q3.3 Create `src/integration/dailyIncomeDashboard.test.tsx` — daily income create/edit/delete updates day metrics through the real provider revision.

**Completion evidence:** Q3 adds five deterministic, test-only integration scenarios
using real `RepositoryProvider`, `LocalStateGateway`, local adapters, and public
repository contracts. No production behavior changed. Browser refresh persistence is
not claimed here because jsdom does not execute a real browser refresh; the tests
instead prove persisted state through the local gateway and provider remount paths.
Q3 is complete; Q4 is next.

## Q4 — Gate Configuration (~50 lines)

**Commit**: `chore(config): quality gate thresholds in openspec/config.yaml — Q4`
**Specs**: `quality-gates` (gate configuration)
**Gate**: `npm run test:run && npm run build && npm run lint && npm run test:coverage` all exit 0. Update `docs/terminal-todo.md`.
**TDD note**: RED/GREEN not applicable — configuration-only milestone, no production code.

- [x] Q4.1 Update `openspec/config.yaml` — enable integration, declare all gate commands, preserve strict TDD and explicit coverage policy.
- [x] Q4.2 Run full gate suite and confirm all exit 0.

**Completion evidence:** `integration: true` reflects the Q3 Vitest scenarios using
real local adapters and `RepositoryProvider`. `vitest.config.ts` continues to enforce
`allowOnly: false`. Every command is explicit, including `git diff --check`. Coverage
is informational globally: the approved G2-LOCAL/G3-LOCAL policy is >=90% reachable
V8 branch coverage per named module, not a false application-wide threshold.

## Q5 — Exploratory QA Charters (0 code)

**Commit**: `docs(qa): exploratory charters with severity tracking — Q5`
**Specs**: `quality-gates` (exploratory QA charters, severity tracking)
**Gate**: All charter files exist. Update `docs/terminal-todo.md`.
**TDD note**: RED/GREEN not applicable — documentation-only milestone, no production code.

- [ ] Q5.1 Create `docs/qa-exploratory/refresh-persistence.md` — charter + session sheet.
- [ ] Q5.2 Create `docs/qa-exploratory/corrupt-recovery.md` — charter + session sheet.
- [ ] Q5.3 Create `docs/qa-exploratory/responsive-layout.md` — charter + session sheet (320px/1920px).
- [ ] Q5.4 Create `docs/qa-exploratory/keyboard-navigation.md` — charter + session sheet.
- [ ] Q5.5 Each charter includes severity tracking (critical/major/minor).

## GMVP — GLM 5.2 Final Review (0 code)

**No commit** — verification and review only.
**Specs**: `quality-gates` (GLM 5.2 final review, 800-line guard, documentation sync)
**Gate**: All gates pass. Demo walkthrough executes. QA charters closed. Update `docs/terminal-todo.md` — all milestones `[x]`.
**TDD note**: RED/GREEN not applicable — review-only milestone, no production code.

- [ ] GMVP.1 Run `npm run test:run && npm run build && npm run lint && npm run test:coverage` — all exit 0.
- [ ] GMVP.2 Execute `docs/demo-script.md` end-to-end against fresh browser session.
- [ ] GMVP.3 GLM 5.2 code review of `src/`, `docs/`, `openspec/`.
- [ ] GMVP.4 Verify all Q5 charters complete, critical findings resolved.
- [ ] GMVP.5 Verify `docs/terminal-todo.md` shows all milestones `[x]`.
- [ ] GMVP.6 Verify no files modified under `openspec/changes/admin-managed-email-auth/` or `src/lib/supabase/`.
- [ ] GMVP.7 Persist final state as `sdd/local-demonstrable-mvp/verify`.
