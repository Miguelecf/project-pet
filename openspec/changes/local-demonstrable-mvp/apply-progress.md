# Apply Progress: Local Demonstrable MVP

## Completed milestones

- [x] M0.2 — Async repository contracts and executable conformance suites.
- [x] M0.3a — LocalStateSchema, defensive atomic gateway, catalog local repositories, and persisted-envelope validation.
- [x] M0.3b — Invoice/payment/daily-income adapters, deterministic seed data, and restore.
- [x] M1.1 — BrowserRouter route map, accessible layout, and responsive sidebar navigation.
- [x] M1.2 — StateOverlay, ConfirmDialog, skip-link, and route-heading focus management.

## Completed tasks

- [x] 0.2.1–0.2.13: Async module contracts, reusable suites, and corrective conformance harness.
- [x] 0.3a.1–0.3a.10: Gateway coverage, complete state schema, supplier/category/settings adapters, shared local test fixtures, and persisted-envelope validation.
- [x] 0.3b.1–0.3b.11: Invoice/payment/daily-income adapters, deterministic seed data, atomic seed load/restore, and local contract verification.
- [x] 1.1.1–1.1.8: BrowserRouter route map, module placeholders, Layout, Sidebar, application wiring, and navigation refactor verification.
- [x] 1.2.1–1.2.7: Async state overlays, keyboard-safe confirmation dialog, route-heading focus, and skip-link focus jump.

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
| Skip-link keyboard correction | `src/app/Layout.test.tsx` | Component | 5/5 focused Layout/Dialog tests passed. | 2/5 Layout tests failed: initial mount focused `h1`, and Space kept focus on the link. | 5/5 Layout tests passed. | Initial keyboard starting point, native Enter activation (explicit click because jsdom does not run anchor defaults), Space keydown, and post-navigation `h1` focus cover distinct paths. | Route focus runs only after a pathname change; Enter keeps native anchor semantics while Space uses the smallest explicit activation handler. |
| ConfirmDialog restoration correction | `src/components/ConfirmDialog.test.tsx` | Component | Same 5/5 focused baseline. | 3/5 dialog tests failed: cancel and Escape did not restore focus, and an open dialog unmount was not covered. | 5/5 dialog tests passed. | Confirm, cancel, Escape, unmount with a connected trigger, disconnected-trigger safety, and forward/reverse Tab boundaries cover controlled closure paths. | One effect owns capture, focus, and cleanup restoration; restoration checks connected and focusable targets before focusing. |

## Current verification

- Focused M1.2 suite: 10/10 passed.
- `npm run test:run`: 107 passed, 1 skipped.
- `npm run test:coverage`: 107 passed, 1 skipped; statements 91.84%, branches 83.36%, functions 94.23%, lines 98.17%.
- `npm run build` and `npm run lint`: passed.
- `git diff --check`: passed.

## Scope and delivery

- M0.2, M0.3a, M0.3b, M1.1, and M1.2 are complete; M2.1 is next.
- M1.2 adds only shell accessibility primitives; no CRUD, provider, repository, Supabase, or auth behavior.
- No domain type, Supabase, or auth behavior was added.
- Delivery remains direct mainline milestone commits; no prior commit was amended or rewritten.
