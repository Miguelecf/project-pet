# Apply Progress: Local Demonstrable MVP

## Q2 verification — complete

- [x] Q2.1–Q2.3 are complete as a test-only milestone. Existing focused suites
  already provided non-duplicative coverage for the requested financial rounding,
  arithmetic, input rejection, overpayment, status, currency, and ISO-date contracts.
- [x] Added only `domain.test.ts` assertions that prove `ISODate`, `MoneyMinor`, and
  `Quantity` remain distinct branded primitives from their raw values and each other.
- [x] No production source changed.

### Q2 evidence map

| Requirement | Evidence |
|---|---|
| `0.005` and `1.005` half-up rounding | `src/utils/finance.test.ts` exact outputs `1` and `101` |
| Large quantity × small cost | `lineTotalMinor(10_000, 5) === 50_000` |
| Zero, negative, and >3-decimal inputs | finance and validation table tests reject `0`, `-1`, negative money, and `1.0001` |
| Overpayment and derived statuses | finance derives pending/partial/paid and rejects overpayment; payment contract rejects registrations above balance before and after partial payment |
| Currency/status/date/brand contracts | exact `Currency`/`InvoiceStatus` unions; strict ISO-date runtime tests; Q2 branded primitive separation assertions |

### Q2 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Q2.1 | `src/utils/finance.test.ts`, `src/utils/validation.test.ts` | Unit | 71/71 focused Q2 baseline passed | N/A — existing dedicated tests already cover every requested behavior | 71/71 focused suite remained green | Rounding, precision, zero, negative, and decimal-boundary inputs use distinct paths | No production change; duplicate tests avoided |
| Q2.2 | `src/utils/finance.test.ts`, `src/test/contracts/paymentRepositoryContract.ts` | Unit | 71/71 focused Q2 baseline passed | N/A — existing status and registration tests already cover every requested behavior | 71/71 focused suite remained green | Derivation plus pre-payment and post-partial registration overpayment paths | No production change; duplicate tests avoided |
| Q2.3 | `src/types/domain.test.ts`, `src/utils/dates.test.ts` | Type + Unit | 71/71 focused Q2 baseline passed | New branded primitive assertions added before execution; production contracts are intentionally read-only | 5/5 domain type tests passed | Raw string/number separation and money-vs-quantity separation complement existing unions/date validation | Test-only contract addition; no production refactor needed |

### Q2 gate results

- Focused Q2 suite: **72/72 passed**.
- Full suite: **321 passed, 1 skipped**. Coverage: **321 passed, 1 skipped**;
  **95.57% statements, 90.36% branches, 98.04% functions, 98.34% lines**.
- `npm run build`, `npm run lint`, and `git diff --check` passed sequentially.
- Next: Q3 integration tests.

## Completed milestones

- [x] M0.2 — Async repository contracts and executable conformance suites.
- [x] M0.3a — LocalStateSchema, defensive atomic gateway, catalog local repositories, and persisted-envelope validation.
- [x] M0.3b — Invoice/payment/daily-income adapters, deterministic seed data, and restore.
- [x] M1.1 — BrowserRouter route map, accessible layout, and responsive sidebar navigation.
- [x] M1.2 — StateOverlay, ConfirmDialog, skip-link, and route-heading focus management.
- [x] M2.1 — Repository provider, supplier CRUD routes/forms, and soft delete.
- [x] M2.2 — Category CRUD routes/forms and block-delete protection.
- [x] M2.3 — Settings CRUD routes/forms and currency-lock enforcement.
- [x] G2-LOCAL — Catalog reachable branch-coverage gate.
- [x] M3.1 — Pure financial calculations, dates, and validation utilities.
- [x] M3.2 — Revision-aware invoice create/edit forms and line editor.
- [x] M3.3 — Invoice list/detail pages with payment-derived status badges.
- [x] M3.4 — Payment registration and void with production load retry.
- [x] M3.5 — Safe invoice deletion and retained-invoice restore.
- [x] M3.6 — Provider-backed due-date alerts in the dashboard placeholder.
- [x] M4.1 — Daily-income CRUD pages, routes, and provider revision refresh.

## Completed tasks

- [x] 0.2.1–0.2.13: Async module contracts, reusable suites, and corrective conformance harness.
- [x] 0.3a.1–0.3a.10: Gateway coverage, complete state schema, supplier/category/settings adapters, shared local test fixtures, and persisted-envelope validation.
- [x] 0.3b.1–0.3b.11: Invoice/payment/daily-income adapters, deterministic seed data, atomic seed load/restore, and local contract verification.
- [x] 1.1.1–1.1.8: BrowserRouter route map, module placeholders, Layout, Sidebar, application wiring, and navigation refactor verification.
- [x] 1.2.1–1.2.7: Async state overlays, keyboard-safe confirmation dialog, route-heading focus, and skip-link focus jump.
- [x] 2.1.1–2.1.10: Revision-aware local repositories, supplier loading states, accessible list/form routes, normalized validation, and confirmed soft delete.
- [x] 2.2.1–2.2.7: Revision-aware category loading states, accessible list/form routes, trimmed normalized validation, and invoice-line reference protection.
- [x] 2.3.1–2.3.7: Revision-aware settings loading, validated ARS/USD and due-alert saves, currency-lock errors, accessible form controls, and persistence reload.
- [x] G2.1–G2.3: Catalog coverage review, meaningful reachable-path tests, documented per-module threshold, and sequential gate verification.
- [x] 3.1.1–3.1.9: Table-driven pure finance/date/validation tests, deterministic safe-integer calculations, strict injected-clock date validation, and refactor verification.
- [x] 3.2.1–3.2.7: Revision-aware invoices hook, accessible create/edit form, pure-finance line editor, route wiring, and active-payment edit block.
- [x] 3.3.1–3.3.5: Active invoice list, client detail navigation, contextual lines/payments/totals, derived statuses, conditional edit, and route-state coverage.
- [x] 3.4.1–3.4.6: Revision-aware payment hook, accessible load-error retry, registration and void confirmation, local-provider persistence, refreshed detail balances, and payment invariant coverage.
- [x] 3.5.1–3.5.5: Confirmed delete/restore controls, active-payment blocking, retained-invoice filter, and real local-provider persistence coverage.
- [x] 3.6.1–3.6.4: Fixed-clock overdue/due-soon alerts, settings boundary, active-balance filtering, semantic badges/list, and detail navigation.
- [x] 4.1.1–4.1.7: Revision-aware daily-income hook; accessible list, form, routes, validation, currency snapshots, confirmation, and persisted refresh behavior.

## TDD cycle evidence

| Task | Test file | Layer | RED | GREEN | REFACTOR |
|---|---|---|---|---|---|
| 0.3b.1–0.3b.2 | `LocalInvoiceRepository.test.ts` | Unit | Missing module; 0 tests collected. | 2/2 passed. | Reused gateway state and retained active-payment edit guard. |
| 0.3b.3–0.3b.4 | `LocalPaymentRepository.test.ts` | Unit | Missing module; 0 tests collected. | 4/4 passed. | Centralized persisted balance/status derivation. |
| 0.3b.5–0.3b.6 | `LocalDailyIncomeRepository.test.ts` | Unit | Missing module; 0 tests collected. | 2/2 passed. | Preserved currency snapshot and descending reads. |
| 0.3b.7–0.3b.8 | `SeedData.test.ts` | Unit | Missing module; 0 tests collected. | 2/2 passed. | Inline deterministic fake data retained. |
| 0.3b.9–0.3b.10 | `LocalStateGateway.test.ts` | Unit | 2 tests failed: `loadSeed is not a function`. | 25/25 passed. | `loadSeed()` and `restore()` clone then use one validated atomic write. |
| 0.3b.11 | Focused local suite | Unit | N/A — verification-only task. | 35/35 passed. | Calendar mutant copies `SeedData.ts` with its isolated gateway copy. |
| 1.1.1 | `AppRouter.test.tsx` | Component | Missing `AppRouter` module; suite failed to collect. | Route scenarios passed. | Kept module placeholders intentionally limited to headings and deferred-scope messages. |
| 1.1.2 | `AppRouter.test.tsx` | Component | Missing `AppRouter` module; suite failed to collect. | 7/7 route scenarios passed. | Route map uses module wildcards and a replacement catch-all redirect. |
| 1.1.3 | `Layout.test.tsx` | Component | Missing `Layout` module; suite failed to collect. | Header, module link, skip target passed. | Shared demo header and footer live in Layout. |
| 1.1.4 | `Layout.test.tsx` | Component | Missing `Layout` module; suite failed to collect. | Layout scenario passed. | Main target remains focusable without adding M1.2 focus management. |
| 1.1.5 | `Sidebar.test.tsx` | Component | Missing `Sidebar` module; suite failed to collect. | Desktop, mobile toggle/close, active-link, and resize scenarios passed. | One breakpoint constant aligns responsive behavior at 768px. |
| 1.1.6 | `Sidebar.test.tsx` | Component | Missing `Sidebar` module; suite failed to collect. | 4/4 sidebar scenarios passed. | NavLink supplies semantic active state; mobile close returns to the collapsed toggle. |
| 1.1.7 | `App.test.tsx` | Component | Existing App semantics: 3/3 safety net passed. | App semantic and shell suite 15/15 passed. | App retains its dashboard foundation content inside Layout. |
| 1.1.8 | Focused shell suite | Component | N/A — verification-only task. | 15/15 focused; 95 passed, 1 skipped full. | CSS breakpoint corrected to match the 768px behavior contract. |

### M1.1 TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1.1 | `AppRouter.test.tsx` | Component | N/A (new) | Missing `AppRouter` module; 0 tests collected. | Route test passed after implementation. | Dashboard plus five module paths and catch-all redirect. | Placeholder content remains explicitly deferred. |
| 1.1.2 | `AppRouter.test.tsx` | Component | N/A (new) | Same route-suite RED. | 7/7 route scenarios passed. | Wildcard child paths plus redirect cover distinct matching branches. | Declarative route map retained. |
| 1.1.3 | `Layout.test.tsx` | Component | N/A (new) | Missing `Layout` module; 0 tests collected. | Layout scenario passed. | Header, local-demo badge, NavLink, and skip target assertions. | Common shell extracted. |
| 1.1.4 | `Layout.test.tsx` | Component | N/A (new) | Same layout-suite RED. | Layout scenario passed. | Navigation and main-region semantics both exercised. | No further change needed. |
| 1.1.5 | `Sidebar.test.tsx` | Component | N/A (new) | Missing `Sidebar` module; 0 tests collected. | Sidebar scenarios passed. | Desktop links, mobile closed/open/close, and resize path. | Shared breakpoint constant extracted. |
| 1.1.6 | `Sidebar.test.tsx` | Component | N/A (new) | Same sidebar-suite RED. | 4/4 sidebar scenarios passed. | Two viewport modes, close handler, and active semantics. | NavLink active semantics retained. |
| 1.1.7 | `App.test.tsx` | Component | 3/3 existing App tests passed. | N/A — pure wiring. | 15/15 focused shell and App semantics passed. | Existing dashboard + new router paths. | App delegates common shell to Layout. |
| 1.1.8 | Focused shell suite | Component | 15/15 focused tests passed. | N/A — verification-only. | 15/15 focused; 95 passed, 1 skipped full. | All M1.1 route/layout/sidebar behaviors. | CSS breakpoint matches 768px contract. |

### M1.1 corrective gate evidence

| Correction | Test file | Safety net | RED | GREEN | REFACTOR |
|---|---|---|---|---|---|
| Honest dashboard disclosure | `App.test.tsx` | 6/6 affected App/Sidebar tests passed. | The revised disclosure assertion failed against the stale claim that navigation was unavailable. | 7/7 affected tests passed after copy correction. | Kept the existing local-only/no-account/no-cloud disclosure. |
| Sidebar interaction semantics | `Sidebar.test.tsx` | Same affected-test baseline. | New active-link and close-handler assertions were added to the existing behavior. | Active `/suppliers` link exposes `aria-current="page"` and `active`; open → close returns to collapsed navigation. | No production change was needed; the tests exercise the existing `NavLink` and state handler. |

### M1.2 TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.2.1 | `StateOverlay.test.tsx` | Component | N/A (new) | Missing `StateOverlay` module; suite failed to collect. | Loading status/spinner, inert content, error actions, and empty action passed. | Loading, error-dismiss/retry, and empty-create scenarios use distinct states. | Added an accessible progressbar and made errors actually dismiss themselves. |
| 1.2.2 | `StateOverlay.test.tsx` | Component | N/A (new) | Same missing-module RED. | 3/3 component scenarios passed. | Error callbacks and empty action prove separate callback paths. | Defaults remain small and controlled by explicit props. |
| 1.2.3 | `ConfirmDialog.test.tsx` | Component | N/A (new) | Missing `ConfirmDialog` module; suite failed to collect. | Confirm/restore plus Escape/trap scenarios passed. | Forward and reverse Tab cycles exercise both focus boundaries. | Focus restoration is retained in a single effect. |
| 1.2.4 | `ConfirmDialog.test.tsx` | Component | N/A (new) | Same missing-module RED. | 2/2 dialog scenarios passed. | Confirm, Escape cancel, and two-way Tab behavior prove controlled-close paths. | Semantic `dialog`, title, and description relationships retained. |
| 1.2.5 | `Layout.test.tsx` | Component | 1/1 pre-existing Layout scenario passed. | Route navigation left focus on `body`. | Categories heading received focus after navigation. | Existing shell scenario and a distinct supplier → category route exercise the location effect. | Heading lookup remains scoped to the main region. |
| 1.2.6 | `Layout.test.tsx` | Component | 1/1 pre-existing Layout scenario passed. | Same route-focus RED. | 2/2 Layout scenarios passed. | Route focus executes on pathname changes only. | Main-region ref avoids global page queries. |
| 1.2.7 | `Layout.test.tsx` | Component | 2/2 route/layout scenarios passed. | Activating skip link left focus on the link. | Skip link focuses `#main-content`; 3/3 Layout scenarios passed. | Keyboard focus and activation use the real anchor target. | Existing focus-visible CSS remains the visual disclosure mechanism. |

### M1.2 corrective gate TDD evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Skip-link traversal and activation evidence | `src/app/Layout.test.tsx` | Component | 10/10 focused M1.2 tests passed before this correction. | The causal Enter `keydown` assertion failed: focus remained on the skip link (9/10 focused). | 10/10 focused tests passed after the explicit Enter/Space handler. | `userEvent.setup()` + `await user.tab()` starts at `body` and reaches the first source-order focusable skip link; independent Enter and Space keydown paths both focus main; route navigation still focuses `h1`. | Extracted a named key handler; its click handler does not cancel the anchor default, preserving the native `href` behavior. |
| ConfirmDialog disconnected-trigger evidence | `src/components/ConfirmDialog.test.tsx` | Component | Same 10/10 focused baseline. | Strengthened test passed on first run because the existing restoration guard already rejected detached triggers; no production correction was needed. | 10/10 focused tests passed with trigger focused before opening, removed before closure, and focus verified not to land on the disconnected element. | Confirm, cancel, Escape, controlled unmount, detached trigger, and forward/reverse Tab boundaries cover all closure paths. | Retained one effect for capture, dialog focus, and guarded cleanup restoration. |

## M1.2 historical verification

- Focused M1.2 suite: 10/10 passed.
- `npm run test:run`: 107 passed, 1 skipped.
- `npm run test:coverage`: 107 passed, 1 skipped; statements 91.71%, branches 83.05%, functions 94.20%, lines 98.00%.
- `npm run build` and `npm run lint`: passed.
- `git diff --check`: passed.

### M2.1 TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 2.1.1–2.1.3 | `src/app/RepositoryProvider.test.tsx` | Component | 15/15 shell/dialog tests; 2/2 local supplier tests | Missing provider/context modules; 4 suites failed to collect. | 2/2 provider scenarios passed. | Successful create increments once, duplicate rejection leaves revision unchanged, restore resets seed and increments. | Shared mutation proxy centralizes successful-write revisions. |
| 2.1.4–2.1.5 | `src/modules/suppliers/useSuppliers.test.tsx` | Component | N/A (new) | Missing provider/hook modules; suite failed to collect. | 3/3 hook scenarios passed. | Data, error-to-retry recovery, and provider restore revision refetch use distinct paths. | Refresh is a named callback shared by effect and retry UI. |
| 2.1.6–2.1.7 | `src/modules/suppliers/SupplierPage.test.tsx`, `src/app/AppRouter.test.tsx` | Component | 21/21 focused baseline | The added list-edit click and real-provider delete scenarios initially failed only because this test environment does not install jest-dom matchers. | 13/13 named page/router scenarios passed after replacing unsupported matcher calls with exact visible text assertions. | Active versus deleted data, empty action, real client-side edit navigation with prefilled form, failed deletion error/retry, and confirmed provider revision/refetch each exercise distinct rendering paths. | Active filtering stays explicit at the page boundary. |
| 2.1.8–2.1.9 | `src/modules/suppliers/SupplierForm.test.tsx` | Component | 21/21 focused baseline | The added edit-duplicate and cancel-delete scenarios initially failed only because this test environment does not install jest-dom matchers. | 5/5 form scenarios passed after exact alert text and dialog-scoped Cancel assertions. | Trimmed create, empty/duplicate errors, duplicate edit without stored mutation, update, confirmed delete, and cancelled delete cover validation and mutation branches. | Shared save/delete error handling keeps failures visible. |
| 2.1.10 | Focused supplier suite | Component | 21/21 focused baseline | N/A — verification-only task. | 25/25 focused scenarios passed: 23 named M2.1 tests plus 2 local supplier contract tests. | All supplier acceptance scenarios run together. | No further refactor required. |

## M2.1 verification

- Focused supplier/provider/router suite: 25/25 passed (23 named M2.1 tests plus 2 local supplier contract tests).
- `npm run test:run`: 123 passed, 1 skipped.
- `npm run test:coverage`: 123 passed, 1 skipped; statements 91.92%, branches 83.36%, functions 94.29%, lines 97.84%.
- `npm run build`, `npm run lint`, and `git diff --check`: passed.

### M2.2 TDD Cycle Evidence
| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.2.1–2.2.2 | `src/modules/categories/useCategories.test.tsx` | Component | 12/12 AppRouter/local-category tests passed. | Missing `useCategories` module; suite failed to collect. | 3/3 hook scenarios passed. | Loading/data, error/retry, and real-provider restore revision paths. | Named refresh callback is shared by effect and retry. |
| 2.2.3–2.2.4 | `src/modules/categories/CategoryPage.test.tsx`, `src/app/AppRouter.test.tsx` | Component | 12/12 AppRouter/local-category tests passed. | Missing `CategoryPage` module; suite failed to collect. | 4/4 page scenarios passed. | Multiple-item list/edit link, empty action, two-line reference block, and real-provider confirmed unreferenced deletion/refetch. | Reference check precedes confirmation; repository remains the enforcement boundary. |
| 2.2.5–2.2.6 | `src/modules/categories/CategoryForm.test.tsx` | Component | N/A (new file). | Missing `CategoryForm` module; suite failed to collect. | 4/4 form scenarios passed. | Trimmed create, empty/duplicate validation, unique update, and duplicate normalized edit with real local-state immutability. | Shared save failure handling keeps validation and repository errors accessible. |
| 2.2.7 | Focused category/local suite | Component + Unit | 24/24 focused scenarios passed. | N/A — verification-only task. | 24/24 focused scenarios passed. | Hook, page, form, router, and local contract paths run together. | No further refactor required. |

### M2.2 corrective gate TDD evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| Category create-action routing | `src/app/AppRouter.test.tsx` | Component | 10/10 router scenarios passed. | List and empty actions lacked the required `New Category` accessible name; 2 new click-through scenarios failed. | 12/12 router scenarios passed after both actions used `New Category`. | Seeded list link and empty-state button each navigate client-side to `/categories/new` and render the create form. | Kept the existing link/button interaction patterns. |
| Category deletion failure semantics | `src/modules/categories/CategoryPage.test.tsx` | Component | 4/4 category page scenarios passed. | New one-line reference, cancel, and error-path assertions exposed missing semantic evidence; reference-count assertions were scoped to the visible message instead of overlay action text. | 8/8 category page scenarios passed. | One real seed invoice line, two references, cancelled unreferenced deletion, rejected reference check, and rejected confirmed deletion exercise separate branches. | Replaced touched weak existence assertions with exact semantic text or state assertions. |
| Category hook assertion quality | `src/modules/categories/useCategories.test.tsx` | Component | 3/3 hook scenarios passed. | N/A — assertion-quality correction only. | 3/3 hook scenarios passed with exact visible state text. | Loading/data, error/retry, and restore revision remain distinct paths. | Removed all touched `toBeDefined()` assertions. |

## M2.2 verification
- Focused category/form/hook/router and local-category contract suites: 30/30 passed sequentially.
- `npm run test:run`: 141 passed, 1 skipped.
- `npm run test:coverage`: 141 passed, 1 skipped; coverage 92.18% statements, 83.36% branches, 94.08% functions, 97.89% lines.
- `npm run build`, `npm run lint`, and `git diff --check`: passed sequentially.

### M2.3 TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.3.1–2.3.2 | `src/modules/settings/useSettings.test.tsx` | Component | 2/2 local-settings contract tests passed. | Missing `useSettings` module; suite failed to collect. | 2/2 hook scenarios passed. | Complete defaults/successful save and rejected combined lock preserve loaded settings. | Shared refresh supports initial load and provider revision refetch. |
| 2.3.3–2.3.4 | `src/modules/settings/SettingsPage.test.tsx` | Component | 12/12 router tests passed. | Missing `SettingsPage` module; suite failed to collect. | 3/3 page scenarios passed. | No-record save/reload, invoice-only rejection, daily-income-only rejection, and matching-currency due-alert update use real local state. | Page delegates validation and errors to the form while retaining semantic status feedback. |
| 2.3.5–2.3.6 | `src/modules/settings/SettingsForm.test.tsx` | Component | N/A (new file). | Missing `SettingsForm` module; suite failed to collect. | 2/2 form scenarios passed. | Invalid non-negative-whole input and combined invoice/daily-income error cover local and repository validation paths. | Native `min` validation was removed so the accessible application error is consistently displayed. |
| 2.3.7 | Focused settings/local/router suite | Component + Unit | 23/23 sequential focused settings/local/router test executions passed. | N/A — verification-only task. | 23/23 focused scenarios passed. | Hook, page, form, real local repository, and routed form semantics cover both financial record types. | Local repository produces type-specific lock messages without mutating persisted settings. |
## Scope and delivery
- M0.2, M0.3a, M0.3b, M1.1, M1.2, M2.1, M2.2, M2.3, and G2-LOCAL are complete; M3.1 is next and unstarted.
- M2.3 adds only settings catalog behavior over RepositoryProvider and LocalSettingsRepository; real invoices and daily incomes appear only as existing local records and test fixtures for currency-lock enforcement. Invoice, payment, daily-income, and dashboard production UI, domain types, Supabase, and auth remain deferred.
- Delivery remains direct mainline milestone commits; no prior commit was amended or rewritten.
- The first parallel coverage invocation raced the calendar-mutant test's temporary directory and produced five false mutant-suite failures; a sequential rerun passed 135/135 executable tests and cleaned the temporary directory.

## M2.3 verification
- Focused settings hook/page/form, local-settings contract, and router suites: 23/23 passed sequentially.
- `npm run test:run`: 150 passed, 1 skipped.
- `npm run test:coverage`: 150 passed, 1 skipped; coverage 92.25% statements, 83.52% branches, 94.31% functions, 97.78% lines.
- `npm run build`, `npm run lint`, and `git diff --check`: passed sequentially.

## G2-LOCAL verification — complete

- [x] G2.1 reviewed supplier, category, and settings coverage and documented the reachable >=90% per-module threshold.
- [x] G2.2 preserved meaningful supplier, category, and settings error/retry/cancel/navigation/mutation tests only; no product behavior changed.
- [x] G2.3 passed catalog-focused tests, full tests, coverage, build, lint, and diff checks sequentially.
- Catalog branch coverage: suppliers **94.44%**, categories **96.87%**, settings **95.45%**.
- Retained unreachable defensive guards: `SupplierPage.tsx:15` and `CategoryPage.tsx:28` require confirmations that public behavior can invoke only after selecting an entity; `SupplierForm.tsx:35` guards a dialog whose Delete control exists only with a supplier; `SettingsPage.tsx:17` requires `settings === null` without an error although the contract returns defaults or the error overlay handles failed reads.

### G2-LOCAL TDD cycle evidence

| Task | Test files | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| G2.1 | Existing nine catalog test files | Component | 48/48 catalog-focused tests passed before documentation updates | N/A — coverage-policy review | N/A — no production code changed | Three modules and distinct reachable error/retry/cancel/navigation/mutation paths | Documentation only; defensive production guards retained |
| G2.2 | Existing nine catalog test files | Component | 48/48 catalog-focused tests passed | Tests were already uncommitted from the blocked attempt and were reviewed before preservation | 48/48 catalog-focused tests passed | Supplier/category/settings paths exercise distinct reachable branches | No product-code refactor; retained valid tests |
| G2.3 | Catalog suite and full gate commands | Component | 48/48 catalog-focused tests passed | N/A — verification-only | All required commands exited 0 | Focused plus full-suite and per-module coverage evidence | No code changes |

**Historical next marker:** M3.1 followed G2-LOCAL.

## M3.1 verification — complete

- [x] 3.1.1–3.1.9 completed using only pure dependency-free utilities and unit tests.
- `lineTotalMinor` normalizes valid quantities to thousandths, uses safe-integer arithmetic, and rounds half-up once per line.
- `invoiceTotals` sums rounded line totals with zero default tax; `deriveStatus` exposes only pending, partially paid, and paid while rejecting overpayment.
- `validateISODate` uses an injected `Clock`; issue, payment, and sale dates reject future values, while due dates allow them.
- Focused utilities: 59/59 passed. Full suite: 223 passed, 1 skipped. Coverage: 93.42% statements, 86.46% branches, 95.95% functions, and 98.18% lines. Build, lint, and diff check passed sequentially.

### M3.1 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.1.1–3.1.4 | `src/utils/finance.test.ts` | Unit | N/A (new files) | Missing `finance` module; focused suite collected 0 tests and failed. | 32/32 finance tests passed. | Standard/decimal/0.005/large inputs, invalid values, empty/multi-line totals, all statuses, overpayment, and 100 repeated calls. | Integer thousandths arithmetic kept line rounding independent of floating-point multiplication. |
| 3.1.5–3.1.6 | `src/utils/dates.test.ts` | Unit | N/A (new files) | Missing `dates` module; focused suite collected 0 tests and failed. | 13/13 date tests passed. | Valid/leap/invalid dates, today/future boundary, three restricted date kinds, and future due dates. | `isFuture` now validates both supplied dates and injected clock output before comparison. |
| 3.1.7–3.1.8 | `src/utils/validation.test.ts` | Unit | N/A (new files) | Missing `validation` module; focused suite collected 0 tests and failed. | 14/14 validation tests passed. | Valid and invalid finite/precision/safe-integer/blank inputs exercise each validator boundary. | Shared branded validation functions avoid duplicated numeric constraints. |
| 3.1.9 | Focused utility suite | Unit | 59/59 focused tests passed. | N/A — verification-only. | 59/59 focused tests passed. | Financial, date, and validation behavior run together without I/O dependencies. | No further refactor required. |

### M3.1 corrective rounding evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.1.1–3.1.2 corrective rounding | `src/utils/finance.test.ts` | Unit | 27/27 finance tests passed before the correction. | Added `roundHalfUp(1.005) === 101` and unsafe-final-result assertions; focused run failed 1/29 because `Math.floor(1.005 * 100 + 0.5)` returned 100. | 29/29 finance tests passed after decimal-rational half-up rounding and final `Number.isSafeInteger` validation. | Existing 0.005, 1.234, 1.235, large valid quantity, standard line totals, and deterministic-repeat cases cover distinct decimal and integer paths. | Replaced floating multiplication with pure decimal-notation rational arithmetic and a named bigint floor division helper; focused tests stayed 29/29. |

## M3.1 corrective verification — complete

- Corrected `roundHalfUp` without changing domain types, UI, adapters, or I/O boundaries.
- Focused finance tests: 29/29 passed.
- `npm run test:run`: 225 passed, 1 skipped.
- `npm run test:coverage`: 225 passed, 1 skipped; coverage 93.43% statements, 86.24% branches, 95.97% functions, 98.10% lines.
- `npm run build`, `npm run lint`, and `git diff --check`: passed sequentially.

## M3.1 settings gate-stability correction — complete

### First-failure root cause

`SettingsPage.test.tsx:29` was not sharing `localStorage`: every test creates its
own `MemoryStorage` and `LocalStateGateway`. The intermittent state loss came from
`SettingsForm` itself. Its `useEffect` copied every new `settings` prop object into
local form state. A stale settings refresh (including the revision-triggered refresh
after save) could therefore overwrite a just-selected `ARS` value with the prior
`USD` prop before submit. The repository then correctly persisted that overwritten
`USD` input, producing the observed `expected ARS, received USD` failure.

### Corrective TDD evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| M3.1 gate stability | `src/modules/settings/SettingsForm.test.tsx` | Component | `SettingsPage.test.tsx` 4/4 passed before the corrective test; repeated focused run reproduced the original failure after 24 passes. | A stale-prop `rerender` test failed deterministically: save received `{ currency: 'USD', dueAlertDays: 7 }` instead of `{ currency: 'ARS', dueAlertDays: 10 }`. | 4/4 form tests and 4/4 page tests passed after removing the prop-to-local-state synchronization effect. | The regression forces the stale-refresh path; the page test proves save/reload through an isolated real gateway. | Form state is initialized once per mount, so a refresh cannot clobber an active edit; no finance behavior changed. |

### Stable rerun evidence

- Before the correction, 30 sequential focused `SettingsPage` invocations reproduced the failure once (run 25): `SettingsPage.test.tsx:29` received persisted `USD` while `dueAlertDays` was 10.
- After the correction, 30 sequential focused `SettingsPage` invocations passed: 4/4 each, with no shared-storage or module-global state.
- Sequential gate run 1: focused SettingsPage 4/4; `npm run test:run` 226 passed, 1 skipped; two consecutive `npm run test:coverage` runs each 226 passed, 1 skipped (93.41% statements, 86.24% branches, 95.96% functions, 98.09% lines); build, lint, and diff check passed.
- Sequential gate run 2: focused SettingsPage 4/4; `npm run test:run` 226 passed, 1 skipped; `npm run test:coverage` 226 passed, 1 skipped with the same metrics; build, lint, and diff check passed.
- M3.1 remains complete; M3.2 remains the only next, unstarted milestone.

**Historical next marker:** M3.2 followed the M3.1 correction.

## M3.2 verification — complete

- [x] 3.2.1–3.2.7 completed with real `RepositoryProvider` local adapters in production paths; no direct `localStorage` or Supabase imports entered invoice UI.
- Create validates supplier/category IDs, required product reference and description, optional external SKU, at least one line, positive quantity with at most three decimals, integer non-negative minor-unit cost, and non-future issue date. Due dates remain future-capable.
- `InvoiceLineEditor` displays totals using the M3.1 pure finance utility. Edit routes load existing invoice lines and disable every mutation control when an active payment exists.

### M3.2 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.2.1–3.2.2 | `src/modules/invoices/useInvoices.test.tsx` | Component | N/A (new) | Missing `useInvoices` module; suite collected 0 tests. | 3/3 hook scenarios passed. | Loading/data, error/retry, and provider-revision refetch use distinct repository outcomes. | Memoized repository callbacks prevent route-loading effects from rerunning needlessly. |
| 3.2.3–3.2.4 | `src/modules/invoices/InvoiceForm.test.tsx` | Component | N/A (new) | Missing `InvoiceForm` module; suite collected 0 tests. | 3/3 form scenarios passed. | Valid local create, no-line and quantity/date/cost rejections, successful edit, and active-payment block cover distinct paths. | Form derives repository input from validated drafts and delegates line totals to the editor. |
| 3.2.5–3.2.6 | `src/modules/invoices/InvoiceLineEditor.test.tsx` | Component | N/A (new) | Missing `InvoiceLineEditor` module; suite collected 0 tests. | 3/3 editor scenarios passed. | Dynamic add/remove, category selection/total, and precision/cost validation cover separate paths. | Controlled drafts keep editing and total calculation independent of persistence. |
| 3.2.7 | `src/modules/invoices/InvoiceForm.test.tsx`, `src/app/AppRouter.test.tsx` | Component | 22/22 focused invoice/router tests passed. | Added disabled-control assertion; it failed because active-payment edit blocking did not disable line fields. | 23/23 focused invoice/router scenarios passed after the editor received the disabled state. | Form plus real seeded create/edit route exercise provider-backed loading and active-payment protection. | No further refactor required. |

## M3.2 scope and next

- Invoice list/detail pages and payment UI remain deferred to M3.3/M3.4; `/invoices/*` retains its placeholder except for `/invoices/new` and `/invoices/:id/edit`.
- Focused invoice/router suite: 23/23 passed. Full suite: 236 passed, 1 skipped. Coverage: 92.97% statements, 85.52% branches, 94.41% functions, and 97.66% lines. Build, lint, and diff check passed sequentially.
- **Next:** M3.3 invoice list and detail pages.

## M3.2 corrective persistence and semantic-evidence verification — complete

- Replaced the local adapter's floating `Math.round(quantity * unitCostMinor)` with the shared pure `lineTotalMinor` rule. Persisted create and update totals now use the same thousandths-based half-up calculation as the line editor: `1.255 × 100 = 126`.
- Added real `LocalStateGateway` + `RepositoryProvider` route tests for create and edit. They assert persisted invoice and line fields, then unmount/navigate/refetch to verify the form displays the unchanged stored values.
- Added isolated required supplier ID, category ID, and product-reference submission scenarios. Each exposes the visible validation error and proves neither create nor update is called.
- Strengthened touched invoice test assertions from existence-only checks to exact visible text or concrete persisted object fields.

### M3.2 corrective TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| Persist shared half-up line total | `src/infrastructure/local/LocalInvoiceRepository.test.ts` | Unit | 25/25 focused invoice/local/form/editor/router tests passed. | New create and update round-trip assertions failed: persisted `1.255 × 100` was `125`, not `126`. | 13/13 local repository/form/editor tests passed after importing and calling `lineTotalMinor`. | Create and update each reload their stored invoice and line; both assert total `126`. | Named the local computed value `totalMinor` to avoid shadowing the shared rule. |
| Semantic required identifiers | `src/modules/invoices/InvoiceForm.test.tsx` | Component | 13/13 local repository/form/editor tests passed. | Added supplier, category, and product-reference absent submissions before changing production code; existing validation already made them green. | 16/16 focused local repository/form/editor tests passed. | Each required field is cleared independently and asserts visible error plus zero create/update calls. | Replaced touched line-editor existence assertions with exact text assertions. |
| Provider/gateway create-edit round trip | `src/app/AppRouter.test.tsx` | Component | 14/14 router tests passed. | Added real provider/gateway create and edit/refetch scenarios before production correction; create observed total `125`. | 16/16 router tests passed after adapter correction. | Create and edit use distinct invoices, fields, routes, unmounts, and refetches; both persist/display `126`. | Strengthened touched hook assertions to exact rendered content. |

### M3.2 corrective verification

- Focused local invoice, form, line-editor, hook, and router suite: **32/32 passed**.
- `npm run test:run`: **243 passed, 1 skipped**.
- `npm run test:coverage`: **243 passed, 1 skipped**; **93.37% statements, 86.05% branches, 95.68% functions, 97.66% lines**.
- `npm run build`, `npm run lint`, and `git diff --check`: passed.
- M3.2 remains complete. M3.3 invoice list and detail pages remains the sole next milestone; no list/detail/payment UI, domain, Supabase, or auth work was introduced.

## M3.3 verification — complete

- [x] 3.3.1–3.3.5 completed through `RepositoryProvider` and local repository adapters only; invoice UI has no direct storage or Supabase access.
- `InvoiceListPage` displays active invoices, empty action, client detail links, and badges calculated from each invoice total plus non-voided repository payments rather than persisted `invoice.status`.
- `InvoiceDetailPage` resolves supplier/category context, line and payment history, total/paid/balance, payment-derived status, conditional edit link, and loading/error-retry/not-found states.

### M3.3 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.3.1–3.3.2 | `InvoiceListPage.test.tsx` | Component | 28/28 existing invoice/form/router tests passed | Missing list module; 0 tests collected | 2/2 list scenarios passed | Pending, partial, paid, navigation, and empty paths | Extracted pure display-status mapping. |
| 3.3.3–3.3.4 | `InvoiceDetailPage.test.tsx` | Component | 28/28 existing invoice/form/router tests passed | Missing detail module; 0 tests collected | 3/3 detail scenarios passed | Active/voided payments, not found, repository error/retry | Retry refreshes component state without a page reload. |
| 3.3.5 | `AppRouter.test.tsx` | Component | 16/16 router tests passed | Added routed seeded-list-to-detail scenario before route wiring | 17/17 router scenarios passed | List, new, detail, edit, and missing-detail routes | Replaced obsolete invoice-placeholder expectation with specified not-found behavior. |

## M3.3 scope and next

- Focused list/detail/router suite passed; full and quality gates are recorded with this milestone commit.
- **Next:** M3.4 payment form and void. Payment form, payment mutation, void action, invoice deletion/restore, and due-date alerts are intentionally not implemented.

## M3.4 verification — complete

- [x] Payment registration uses `PaymentRepository` through `RepositoryProvider`; amount is a positive safe integer, payment date is validated against the injected clock, and overpayment is rejected from the latest remaining balance.
- [x] `PaymentForm` shows accessible balance/status feedback, allows partial/exact registration, and requires a non-empty void reason before `ConfirmDialog` confirmation.
- [x] A payment load failure exposes `Retry payment load` in the production form; retry invokes `usePayments.refresh` and restores balance/status and registration controls.
- [x] Cancellation preserves the payment. Confirmed void persists the void reason and refreshes invoice detail history, balance, and payment-derived status.
- [x] No invoice delete/restore, due alerts, direct storage, Supabase, domain, or auth changes were introduced.

### M3.4 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.4.1–3.4.2 | `src/modules/invoices/usePayments.test.tsx` | Component | 23/23 invoice/detail/router tests passed | Missing hook module: two suites could not resolve imports | 2/2 hook scenarios passed | Load/balance/mutations, error-retry, and provider revision refetch | Shared refresh handles both mutation and revision updates. |
| 3.4.3–3.4.4 | `src/modules/invoices/PaymentForm.test.tsx` | Component | 3/3 form scenarios passed before correction | Production-form retry test failed because no semantic retry button existed | 4/4 form scenarios passed | Partial/exact registration; real load-error retry/recovery; zero/future/overpay; mandatory reason/cancel/confirm | Local validation remains presentation-level; repository preserves final invariant enforcement. |
| 3.4.5 | `src/app/AppRouter.test.tsx`, `InvoiceDetailPage.test.tsx` | Component | 17/17 router scenarios passed before integration assertion | New real local-provider payment/void scenario failed while form was loading | 18/18 router scenarios passed | Registration then persisted void prove refreshed partial/pending states and balances | Detail observes provider revision and its own mutation refresh callback. |
| 3.4.6 | Focused invoice/payment/router suite | Component | 27/27 passed | N/A — verification task | 27/27 passed | Hook, form, detail, router, and real gateway paths | No further refactor required. |

## M3.4 gate evidence

- Focused payment/detail/router suite: **27 passed**.
- Full suite: **256 passed, 1 skipped**.
- Coverage: **93.43% statements, 85.40% branches, 95.76% functions, 97.56% lines**.
- `npm run build`, `npm run lint`, and `git diff --check` passed sequentially.
- **Next:** M3.5 safe delete and restore. M3.6 due alerts remain deferred.

## M3.5 verification — complete

- [x] `InvoiceDetailPage` confirms deletion and delegates the final invariant to `InvoiceRepository.softDelete`; active-payment rejection is announced as `Cannot delete: void all payments first`.
- [x] Deletion after voiding all payments is allowed; cancellation makes no mutation.
- [x] `InvoiceListPage` excludes deleted invoices by default, exposes an explicit retained filter, and confirms restore through `InvoiceRepository.restore`.
- [x] Real `LocalStateGateway` + `RepositoryProvider` coverage proves persisted `deletedAt` becomes non-null on deletion and `null` on restore before the invoice returns to the active list.

### M3.5 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.5.1–3.5.2 | `InvoiceDetailPage.test.tsx` | Component | 23/23 list/detail/router tests passed | Delete controls and confirmation were absent; new tests failed. | 5/5 detail tests passed after confirmed repository mutation and accessible error handling. | No-payment confirm/cancel, active-payment block, and all-voided deletion exercise distinct invariant paths. | Kept repository as the authoritative persistence/invariant boundary. |
| 3.5.3–3.5.4 | `InvoiceListPage.test.tsx`, `AppRouter.test.tsx` | Component | 5/5 detail and 2/2 list tests passed | Deleted toggle/restore action were absent; new tests failed. | List/detail/router/local focused suite passed. | Mocked retained filtering plus real local-provider delete → active exclusion → restore persistence paths. | Filter state remains page-local; provider revision refreshes active results. |
| 3.5.5 | Focused invoice suite | Component + Unit | Focused suites passed before final verification. | N/A — verification task. | Focused invoice suite passed. | Repository, detail, list, and routed gateway paths cover all invariant #8 states. | No further refactor needed. |

## M3.5 scope and next

- M3.5 uses existing local repositories/provider and `ConfirmDialog`; no direct storage, Supabase, domain, auth, dashboard, due-alert, or M4 work was introduced.
- **Next:** M3.6 due-date alert widget.

## M3.6 verification — complete

- [x] `DueAlerts` reads existing invoice, payment, and settings repositories through `RepositoryProvider`; no storage, Supabase, domain, or auth boundary changed.
- [x] It excludes deleted, paid, undated, and out-of-window invoices; due-soon includes the exact `dueAlertDays` boundary against an injected clock.
- [x] The dashboard placeholder renders the widget only; metrics, a full dashboard page, and daily-income behavior remain deferred to M4.

### M3.6 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 3.6.1 | `src/modules/dashboard/DueAlerts.test.tsx` | Component | N/A (new module) | Missing `DueAlerts` module; focused suite collected 0 tests. | 3/3 widget scenarios passed. | Overdue, ordinary due-soon, exact configured boundary, no-alert exclusions, and navigation use distinct paths. | Assertions cover semantic text/list/link outcomes rather than CSS. |
| 3.6.2 | `src/modules/dashboard/DueAlerts.tsx` | Component | N/A (new module) | Same missing-module RED. | 3/3 widget scenarios passed. | Payment-derived balances plus deleted/paid/undated/later filtering prevent status-field shortcuts. | Kept alert selection as a pure transformation with injected calendar input. |
| 3.6.3 | `src/App.tsx`, `src/App.test.tsx` | Component | 3/3 existing App tests passed. | Dashboard integration required provider context and initially failed without it. | App plus alert focused suite: 6/6 passed. | Empty alert rendering and widget data rendering exercise both provider-backed states. | The placeholder and all M4 metrics behavior remain intact/deferred. |
| 3.6.4 | `src/modules/dashboard/DueAlerts.test.tsx` | Component | 6/6 focused App/widget tests passed. | New accessible badge/list assertions failed before the widget existed. | 6/6 focused App/widget tests passed. | Text badges identify both overdue and due-soon entries independently of color; list has concrete entries. | Added visual overdue styling only as a supplementary indicator. |

## M3.6 scope and next

- M3.6 is restricted to the due-date widget and current dashboard placeholder. M3.4/3.5 behavior, metrics/full dashboard, daily-income UI, direct storage, Supabase, domain, and auth are unchanged.
- Focused suite: **6 passed**. Full suite: **263 passed, 1 skipped**. Coverage: **93.36% statements, 84.79% branches, 95.80% functions, 97.36% lines**. Build, lint, and diff check passed sequentially; the first all-gates shell exceeded the tool timeout during build, then standalone build/lint/diff passed.
- **Next:** G3-LOCAL core branch-coverage gate.

## G3-LOCAL verification — complete

- [x] G3.1 reviewed the V8 coverage report for core invoice/payment/daily-income paths.
- [x] G3.2 added behavior-driven adapter and invoice UI coverage for mutation/load failures and retries, error fallbacks, generated adapter defaults, state-derived statuses/balances, deleted/active filtering, restore cancellation/failure, persistence invariants, optional inputs, client navigation, deterministic default-clock validation, and async unmount completion/rejection guards. Production code is unchanged.
- [x] G3.3 command gates passed; final sequential rerun is recorded below. G3 is complete under the approved >=90% reachable branch-coverage policy per core module.

| Core path | V8 branch coverage | Status |
|---|---:|---|
| `src/modules/invoices` | 96.73% (178/184) | Complete |
| `src/infrastructure/local/LocalInvoiceRepository.ts` | 100% (39/39) | Complete |
| `src/infrastructure/local/LocalPaymentRepository.ts` | 91.30% (21/23) | Complete |
| `src/infrastructure/local/LocalDailyIncomeRepository.ts` | 100% (17/17) | Complete |

Remaining invoice branches are internally guarded, not reachable from the public UI: `InvoiceForm.tsx:70` requires calling `save()` despite its disabled control when `blocked`; `InvoiceLineEditor.tsx:27` requires `lineTotalMinor` to throw a non-`Error`, although its validators throw `Error`; `InvoiceListPage.tsx:42` requires confirming restore without a restore target; and `PaymentForm.tsx:37`, `:54`, `:59` require submitting without a balance, a non-`Error` validation failure, or confirming void without a dialog target. `LocalPaymentRepository.ts` retains 91.30% because lines 53 and 59 protect malformed persisted state (an active payment total above invoice total, or a payment whose invoice vanished); valid public repository workflows prevent both states. These defensive guards are retained and not force-tested through impossible public UI states or manually malformed persisted internals. At this historical G3 checkpoint, daily-income UI was deferred to M4.1.

### G3-LOCAL TDD cycle evidence

| Task | Test files | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| G3.1 | Coverage report | Unit + Component | 36/36 existing focused core tests passed | N/A — coverage-review task | N/A | Four core paths reviewed | No product code changed |
| G3.2 | Invoice/payment/daily-income adapter tests and invoice component/hook tests | Unit + Component | 13/13 adapter tests passed before continuation | Test-only behavior gaps were added before each focused run; default-clock cases initially stalled under fake timers, then were made deterministic by flushing repository microtasks inside `act`; no production changes | Focused core suite passed | Error/retry/fallback, state transition, filtering, date/balance, generated-default, cancellation, client navigation, optional inputs, and unmount completion/rejection scenarios exercise distinct outcomes | Test-only cleanup; retained guards are not public behavior |
| G3.3 | Focused core suite and full gates | Unit + Component | Focused core suite passed | N/A — verification task | Full suite and coverage passed; final sequential gate evidence follows | Focused and full commands both run | No code refactor |

### G3-LOCAL continuation verification

- Focused core suite: **65/65 passed**.
- Full suite: **292 passed, 1 skipped**.
- Coverage: **292 passed, 1 skipped**; `src/modules/invoices` **96.73% (178/184)** branches, `LocalInvoiceRepository` **100%**, `LocalDailyIncomeRepository` **100%**, and `LocalPaymentRepository` **91.30% (21/23)**.
- `npm run build`, `npm run lint`, and `git diff --check` passed sequentially.
- G3-LOCAL is complete: all core modules meet the approved >=90% reachable branch threshold. The six invoice-module branches and two payment-adapter branches require impossible guarded calls, non-`Error` failures from internal validators, or malformed persistence rather than a valid public workflow. No invalid persisted state was injected only to inflate coverage.
- **Historical next:** M4.1 daily-income CRUD.

## M4.1 verification — complete

- [x] Daily-income loading uses `DailyIncomeRepository` through `RepositoryProvider`, sorts newest sale dates first, and exposes accessible loading, error/retry, and empty states.
- [x] Create/edit routes validate a positive safe-integer minor amount and a non-future ISO sale date before persistence; duplicate sale dates remain rejected by the existing repository invariant.
- [x] Forms disclose the current settings currency for new records and retain the historical currency snapshot for edits. Notes are trimmed or persisted as `null`.
- [x] Delete is hard-delete only after `ConfirmDialog` confirmation; cancellation preserves the persisted record. Successful local mutations publish the provider revision and refresh the provider-backed list.
- [x] Dashboard metrics and weekly-summary implementation remain deferred to M4.2.

### M4.1 TDD cycle evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.1.1–4.1.2 | `src/modules/daily-income/useDailyIncomes.test.tsx` | Component | N/A (new) | Hook test written before hook implementation. | CRUD delegation plus load/retry scenarios passed. | Successful records, load failure/retry, and repository revision refresh cover distinct outcomes. | Reused the established revision-aware hook shape and named `refresh` callback. |
| 4.1.3–4.1.4 | `src/modules/daily-income/DailyIncomePage.test.tsx`, `src/app/AppRouter.test.tsx` | Component | N/A (new page) | Page/route expectations written before page and route implementation. | Descending list, accessible empty action, route persistence, and confirm/cancel delete scenarios passed. | Mocked order/empty state and real local-provider create/edit/delete persistence exercise distinct paths. | Removed the obsolete daily-income placeholder route entry. |
| 4.1.5–4.1.6 | `src/modules/daily-income/DailyIncomeForm.test.tsx` | Component | N/A (new form) | Form expectations written before form implementation. | Valid create, validation/repository rejection, and snapshot-preserving edit scenarios passed. | Positive/zero/future/duplicate inputs plus trimmed and absent notes cover distinct validation paths. | Kept presentation validation local while the repository preserves the uniqueness invariant. |
| 4.1.7 | Focused daily-income/router suite | Component | 28/28 focused tests passed. | N/A — verification task. | Focused suite passed. | Real provider routes persist create/edit and page confirmation persists delete; revision triggers consumer refetch. | No dashboard metric code introduced; M4.2 remains the aggregate consumer. |

## M4.1 scope and next

- M4.1 changes only daily-income hooks/pages/forms/routes and synchronized SDD progress. No dashboard metrics, direct storage/Supabase access, domain contracts, or auth behavior changed.
- **Next:** M4.2 full approved dashboard scope.

## M4.2 approved plan — historical pre-implementation state

- [ ] Day/week/month period filter with inclusive local-calendar boundaries.
- [ ] Period income, non-voided paid expenses, estimated cash result with explicit
  “not net profit” disclosure, and all-time active outstanding/status counts.
- [ ] Current Monday–Sunday income summary, latest 10 active invoices, deterministic
  seven-date inactivity alert, and exact numeric paid-expense category allocation.
- [ ] Existing provider-backed `DueAlerts`, `/` landing route, revision refresh,
  empty/error/retry states, keyboard behavior, and screen-reader labels retained.
- This was the approved scope before implementation. M4.3 and Q2+ remain pending.

## M4.2 verification — complete

- [x] `dashboardAggregates` computes injected-calendar day/week/month ranges without
  parsing record dates as UTC; period income, paid expenses, estimated cash result,
  category allocation, and all-time outstanding/status/latest views use safe integers.
- [x] The root `DashboardPage` reads only the existing provider repositories,
  recomputes on period/revision refresh, and retains provider-backed `DueAlerts`.
- [x] The accessible UI labels period controls, metrics, disclosure, alerts, weekly
  summary, latest detail links, category values, loading, retryable errors, zeros,
  and the seed prompt. M4.3 and Q2+ remain pending.

### M4.2 TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.2.1–4.2.2 | `dashboardAggregates.test.ts` | Unit | New module | Calendar/formula tests written before module | Focused aggregate suite passed | Day/week/month, leap/year boundaries, exclusions, status, weekly zeros, and safe integer paths | Replaced UTC `Date` calendar conversion with arithmetic calendar helpers |
| 4.2.3–4.2.4 | `dashboardAggregates.test.ts` | Unit | Aggregate suite passing | Allocation/latest/inactivity tests written before selectors | Focused aggregate suite passed | Remainders, deterministic ties, zero allocation, both inactivity boundaries | Shared checked addition/subtraction retained for every metric |
| 4.2.5–4.2.7 | `DashboardPage.test.tsx`, `App.test.tsx`, `AppRouter.test.tsx` | Component | Existing root/shell tests passed | Dashboard provider/route expectations preceded root replacement | Focused dashboard/root/router suite passed | Seeded, empty, period, real provider mutation/revision, failure/retry, link, DueAlerts paths | Page stays a repository consumer; no storage/domain changes |
| 4.2.8 | Focused then full gates | Unit + Component | Focused dashboard suite passed | N/A — verification task | Recorded after sequential gates | Full suite, coverage, build, lint, and diff-check | No further behavior refactor needed |

### M4.2 Scope and Delivery

- M4.2 is complete within the 800-line cumulative guard from `fbddf30`; it changes
  dashboard/UI/test/documentation artifacts only. No M4.3, Q2+, domain, persistence,
  Supabase, or auth work was introduced.
- Sequential gates: focused dashboard/root/router **34/34**, full suite **312 passed,
  1 skipped**, coverage **95.61% statements, 90.12% branches, 98.01% functions,
  98.38% lines**, build, lint, and `git diff --check` passed. Commit hash is
   recorded after the milestone commit.

## M4.2 corrective apply after gate failure on `61fb988` — complete

- [x] Replaced number-based proportional multiplication with `BigInt` floor division
  for safe-integer allocation inputs. Conversion back to `number` is guarded, every
  category share remains safe, and residual units preserve line `position`, then ID.
- [x] Added runtime scenarios for exact large allocation reconciliation, zero-total
  allocation, category amount/name/ID ties, line-ID remainder order, latest ten from
  twelve active invoices with deleted exclusion, period-invariant weekly income, and
  real local-provider invoice/payment mutation refreshes.
- [x] M4.3 and Q2+ remain unstarted; no domain, persistence, Supabase, or auth files
  were changed.

### Corrective TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Exact allocation and selector scenarios | `src/modules/dashboard/dashboardAggregates.test.ts` | Unit | 7/7 aggregate tests passed | 3 new scenarios failed against floating allocation and zero-total status handling | 10/10 aggregate tests passed | Large safe values, zero totals, tie rules, latest 10/12, and period-stable weekly output | Extracted guarded `BigInt` conversion and proportional-share helper |
| Real provider mutation refresh | `src/modules/dashboard/DashboardPage.test.tsx` | Component | 4/4 dashboard tests passed | Invoice/payment mutation expectations failed because the test harness did not exercise valid repository transitions | 6/6 dashboard tests passed | Real local gateway invoice deletion plus payment registration and void refresh separate dashboard states | Kept the dashboard as a repository/provider consumer |

### Corrective Verification

- Focused dashboard/aggregate/router suite: **39/39 passed**.
- Full suite: **317 passed, 1 skipped**.
- Coverage: **95.53% statements, 90.32% branches, 98.02% functions, 98.32% lines**.
- `npm run build`, `npm run lint`, and `git diff --check` passed sequentially.
- Corrective commit `0faf355` diff: **135 changed lines** (130 additions, 5 deletions).
  The production/tests subset is **105 changed lines**; the remaining 30 additions are
  this apply-progress evidence. M4.2 is complete only with this corrective commit;
  **M4.3 is next and remains unstarted**.

## M4.3 restore-demo-data prerequisite — complete

- [x] 4.3.0: The dashboard now exposes a client-accessible `Restore demo data`
  action backed solely by `RepositoryProvider.restore()`. It uses the shared
  `ConfirmDialog`, publishes the provider revision after successful restore, and
  shows generic visible success or retryable error feedback without exposing storage
  implementation details or secrets.
- [x] 4.3.1–4.3.2: `docs/demo-script.md` provides the English client-facing,
  full-lifecycle walkthrough and passed content checks for required headings/steps,
  no fenced code blocks, and no implementation details.

### M4.3 prerequisite TDD cycle evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.3.0 | `src/app/RestoreDemoData.test.tsx` | Component | Dashboard suite 6/6 passed | Missing `RestoreDemoData` module; suite failed to collect | 3/3 restore scenarios passed | Confirmed seed restore/refresh, cancel preservation, and failure/retry use distinct real provider/gateway paths | Kept the control small and dashboard-local; reused `ConfirmDialog` and provider revision rather than adding storage access |

### M4.3 prerequisite verification

- Focused restore/layout/dashboard suite: **14/14 passed**.
- Full suite: **320 passed, 1 skipped**.
- Coverage: **95.57% statements, 90.36% branches, 98.04% functions, 98.34% lines**.
- `npm run build`, `npm run lint`, and `git diff --check` passed sequentially.
- The guided walkthrough document is complete. M4.3 is complete and Q2 is next.

## M4.3 demo-script documentation — complete

- [x] `docs/demo-script.md` discloses the local-only, no-account, no-cloud-sync
  boundary and deterministic fake data before the product walkthrough.
- [x] It covers seeded dashboard, catalogs, invoice creation, partial/complete/void
  payment flow, daily income, period metrics, cash-result disclosure, category
  breakdown, inactivity and due alerts, visible restore confirmation, recovery,
  expected results, and client validation questions.
- [x] Documentation checks verified required headings and lifecycle steps; the file
  contains no fenced code blocks or implementation details.

### M4.3 documentation verification

- Markdown content checks passed: all 13 required headings and lifecycle steps are
  present; no fenced code blocks or implementation-detail terms were found.
- `npm run test:run` passed: **320 passed, 1 skipped**. `npm run build`, `npm run
  lint`, and `git diff --check` also passed sequentially after the content checks.
- Documentation-only milestone: no production behavior or tests changed, so strict
  TDD RED/GREEN evidence is not applicable.
- M4.3 is complete; **Q2 domain coverage edge-case tests are next**.
