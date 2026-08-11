# Apply Progress: Local Demonstrable MVP

## Completed milestones

- [x] M0.2 — Async repository contracts and executable conformance suites.
- [x] M0.3a — LocalStateSchema, defensive atomic gateway, catalog local repositories, and persisted-envelope validation.
- [x] M0.3b — Invoice/payment/daily-income adapters, deterministic seed data, and restore.
- [x] M1.1 — BrowserRouter route map, accessible layout, and responsive sidebar navigation.

## Completed tasks

- [x] 0.2.1–0.2.13: Async module contracts, reusable suites, and corrective conformance harness.
- [x] 0.3a.1–0.3a.10: Gateway coverage, complete state schema, supplier/category/settings adapters, shared local test fixtures, and persisted-envelope validation.
- [x] 0.3b.1–0.3b.11: Invoice/payment/daily-income adapters, deterministic seed data, atomic seed load/restore, and local contract verification.
- [x] 1.1.1–1.1.8: BrowserRouter route map, module placeholders, Layout, Sidebar, application wiring, and navigation refactor verification.

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
| 1.1.5 | `Sidebar.test.tsx` | Component | Missing `Sidebar` module; suite failed to collect. | Desktop, mobile toggle, and resize scenarios passed. | One breakpoint constant aligns responsive behavior at 768px. |
| 1.1.6 | `Sidebar.test.tsx` | Component | Missing `Sidebar` module; suite failed to collect. | 3/3 sidebar scenarios passed. | NavLink supplies semantic module navigation and active state. |
| 1.1.7 | `App.test.tsx` | Component | Existing App semantics: 3/3 safety net passed. | App semantic and shell suite 14/14 passed. | App retains its dashboard foundation content inside Layout. |
| 1.1.8 | Focused shell suite | Component | N/A — verification-only task. | 14/14 focused; 94 passed, 1 skipped full. | CSS breakpoint corrected to match the 768px behavior contract. |

### M1.1 TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1.1 | `AppRouter.test.tsx` | Component | N/A (new) | Missing `AppRouter` module; 0 tests collected. | Route test passed after implementation. | Dashboard plus five module paths and catch-all redirect. | Placeholder content remains explicitly deferred. |
| 1.1.2 | `AppRouter.test.tsx` | Component | N/A (new) | Same route-suite RED. | 7/7 route scenarios passed. | Wildcard child paths plus redirect cover distinct matching branches. | Declarative route map retained. |
| 1.1.3 | `Layout.test.tsx` | Component | N/A (new) | Missing `Layout` module; 0 tests collected. | Layout scenario passed. | Header, local-demo badge, NavLink, and skip target assertions. | Common shell extracted. |
| 1.1.4 | `Layout.test.tsx` | Component | N/A (new) | Same layout-suite RED. | Layout scenario passed. | Navigation and main-region semantics both exercised. | No further change needed. |
| 1.1.5 | `Sidebar.test.tsx` | Component | N/A (new) | Missing `Sidebar` module; 0 tests collected. | Sidebar scenarios passed. | Desktop links, mobile closed/open, and resize path. | Shared breakpoint constant extracted. |
| 1.1.6 | `Sidebar.test.tsx` | Component | N/A (new) | Same sidebar-suite RED. | 3/3 sidebar scenarios passed. | Two viewport modes and toggle state. | NavLink active semantics retained. |
| 1.1.7 | `App.test.tsx` | Component | 3/3 existing App tests passed. | N/A — pure wiring. | 14/14 focused shell and App semantics passed. | Existing dashboard + new router paths. | App delegates common shell to Layout. |
| 1.1.8 | Focused shell suite | Component | 14/14 focused tests passed. | N/A — verification-only. | 14/14 focused; 94 passed, 1 skipped full. | All M1.1 route/layout/sidebar behaviors. | CSS breakpoint matches 768px contract. |

## Current verification

- Focused M1.1 shell suite: 14/14 passed.
- `npm run test:run`: 94 passed, 1 skipped.
- `npm run test:coverage`: 94 passed, 1 skipped; statements 91.35%, branches 82.05%, functions 93.54%, lines 98.16%.
- `npm run build` and `npm run lint`: passed.
- `git diff --check`: passed.

## Scope and delivery

- M0.2, M0.3a, M0.3b, and M1.1 are complete; M1.2 is next.
- M1.1 adds only routing, shell navigation, and honest placeholders; no CRUD, provider, overlays, confirmation dialog, or route-heading focus behavior.
- No domain type, Supabase, or auth behavior was added.
- Delivery remains direct mainline milestone commits; no prior commit was amended or rewritten.
