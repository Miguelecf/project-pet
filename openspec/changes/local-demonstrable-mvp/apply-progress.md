# Apply Progress: Local Demonstrable MVP

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

**Next:** M3.2 is next and remains unstarted.
