# Design: Local Demonstrable MVP (M0.2 → GMVP)

## Technical Approach

Preserve completed M0–M4.2. Before M4.3 documentation can describe the full demo
lifecycle, add a small provider-backed restore control to the dashboard; only
`LocalStateGateway` accesses storage.

```text
BrowserRouter → page → hook → RepositoryProvider → repository → LocalStateGateway
Dashboard    ←──────────── revision after successful full-envelope write ──────┘
```

## Architecture Decisions

| Topic | Decision and rationale |
|---|---|
| Dashboard reads | Add no aggregate repository or persistence shape. `DashboardPage` loads active invoices, each invoice’s lines/payments, daily incomes, categories, and settings through existing contracts, then recomputes on provider revision. This preserves future adapter compatibility at acceptable local-demo scale. |
| Periods | A pure calendar helper derives inclusive local day, Monday–Sunday week, and month boundaries from injected `Clock.today()`. Compare strict ISO dates lexically; never parse them as UTC instants. |
| Metric scope | Period applies only to income, paid expenses, cash result, and paid-expense category allocation. Outstanding/status/latest/DueAlerts are active all-time snapshots; weekly summary is always the current local week. This keeps debt and operational alerts visible. |
| Expense allocation | Allocate each qualifying non-voided payment over rounded line totals using integer `floor(payment × line / invoiceTotal)` shares; assign residual units by line position then ID. Aggregate by category and sort amount descending then category name/ID. |
| Exclusions/inactivity | Exclude soft-deleted invoices and every payment attached to them; exclude voided payments. Inactivity means no daily income in `[today-6,today]`, inclusive. Latest 10 sort by issue date desc, created instant desc, ID asc. |

## Contracts and Sequences

```ts
type Recovery = 'ready' | 'needs_seed' | 'unavailable'
interface RepositoryProviderValue { repositories: Repositories; revision: number; restore(): Promise<void> }
interface Clock { now(): ISODateTime; today(): ISODate }
interface IdGenerator { next(kind: 'supplier'|'category'|'invoice'|'line'|'payment'|'dailyIncome'): string }
type DashboardPeriod = 'day' | 'week' | 'month'
interface DateRange { start: ISODate; end: ISODate }
```

```text
Save → repository validates draft/current envelope → calculate/derive → gateway atomic write
     → provider revision++ → hook refetch → active list/dashboard update
Failure → reject typed error → preserve stored envelope/revision → accessible retry/error UI
```

### Restore Demo Data Interaction

`RestoreDemoData` lives in the existing dashboard shell because the walkthrough
starts and ends there. It calls only `RepositoryProvider.restore()` through
`useRepositories`, opens the shared `ConfirmDialog` before mutation, and renders a
local-only confirmation message. A successful restore uses the provider revision to
refresh dashboard consumers and announces success. A failure preserves existing data,
shows a generic accessible error, and permits retry without exposing storage or
credential details.

## File Plan

### Existing files to modify

| File | Planned change |
|---|---|
| `src/App.tsx`, `src/app/AppRouter.tsx`, tests, `src/index.css` | Replace the root placeholder with the full accessible `DashboardPage` at `/`. |
| `src/modules/dashboard/DashboardPage.tsx`, `src/index.css` | Add the client-accessible restore control to the existing dashboard shell. |
| SDD/TODO/plan artifacts | Record the M4.3 restore prerequisite while keeping the walkthrough itself pending. |

`src/types/domain.ts`, `src/types/domain.test.ts`, and `src/lib/supabase/` are existing read-only boundaries.

### Planned files to create

| File | Purpose |
|---|---|
| `src/modules/dashboard/dashboardAggregates.ts` | Pure periods, formulas, allocation, latest, inactivity, and weekly selectors. |
| `src/modules/dashboard/dashboardAggregates.test.ts` | Deterministic unit acceptance coverage. |
| `src/modules/dashboard/DashboardPage.tsx` | Repository consumer and semantic dashboard UI. |
| `src/modules/dashboard/DashboardPage.test.tsx` | Provider, routing, state, refresh, and accessibility coverage. |
| `src/app/RestoreDemoData.tsx` | Confirmed provider restore action with visible success/error feedback. |
| `src/app/RestoreDemoData.test.tsx` | Semantic restore, cancellation, refresh, error, retry, and dialog coverage. |

## Testing, Delivery, and Rollback

The restore prerequisite uses strict RED→GREEN→REFACTOR: semantic component tests
cover named control/dialog, cancellation preservation, successful seed restoration
with revision refresh, and generic failure/retry feedback. M4.2 uses strict RED→GREEN→REFACTOR: pure table-driven tests cover boundaries,
formula reconciliation, exclusions, allocation remainders, ties, and empty data;
provider-backed component tests cover loading/error/retry, revision refresh, route,
filter, disclosure, links, and semantics. Run focused/full/coverage/build/lint/diff
gates. Split M4.2 before commit if it exceeds 800 changed lines.

Rollback MUST proceed in reverse dependency order: docs/UI/dashboard → features/finance → provider/local repositories → gateway/schema → contracts. Revert consumers before providers to remain compile-safe; clear an incompatible newer storage key or restore through the compatible gateway before reverting persistence. Supabase/auth remain paused and untouched.

## Open Questions

None.
