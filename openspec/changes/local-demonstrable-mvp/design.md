# Design: Local Demonstrable MVP (M0.2 → GMVP)

## Technical Approach

**Current fact:** the repository contains React 19/TypeScript/Vite/Vitest scaffolding, baseline contracts in `src/types/domain.ts`, type tests, empty feature directories, and an isolated Supabase boundary. **Planned work:** build a local-first modular monolith where pages call hooks, hooks call async module repositories, and only `LocalStateGateway` accesses `localStorage`. `RepositoryProvider` owns repositories and a revision counter; successful atomic mutations increment revision so consumers refetch.

```text
BrowserRouter → page → hook → RepositoryProvider → repository → LocalStateGateway
Dashboard    ←──────────── revision after successful full-envelope write ──────┘
```

## Architecture Decisions

| Topic | Decision and rationale |
|---|---|
| Contracts | Use separate supplier, category, settings, invoice, payment, and daily-income async interfaces plus adapter contract suites; interface segregation avoids a generic CRUD abstraction. |
| Determinism | Inject `Clock.now()`, `Clock.today()`, and `IdGenerator.next(kind)`. Production uses ISO instants, local calendar dates, and `crypto.randomUUID`; tests use fixed values. Issue, payment, and sale dates reject future ISO dates; due dates may be future. |
| Money/quantity | Preserve baseline fields: `MoneyMinor` integers and persisted `InvoiceLine.quantity`. Validate positive finite quantity with ≤3 decimals, normalize internally to thousandths, then half-up round `quantity × unitCostMinor` once per line with safe-integer guards. Sum rounded lines. Never persist `quantityMillis`. |
| Status/currency | Use only `pending | partially_paid | paid` and `ARS | USD`. Reject overpayment before status derivation. Preserve `Settings { currency, dueAlertDays, timestamps }`; do not add locale or mutate M0.1 contracts. |
| Persistence/recovery | Validate and clone a complete `project-pet-v1` envelope, then perform one `setItem`. Publish neither candidate state nor revision on serialization/write failure. Missing, malformed, or mismatched data yields empty initialized state plus seed prompt; immutable seed restore deep-copies deterministic data. |
| Invariants | Repositories validate normalized uniqueness, references, dates, currency lock, payments, and deletion. Soft-deleted invoices remain stored with `deletedAt`, disappear from active queries/UI, appear under a deleted filter, and can be restored. Daily-income create/edit/delete refreshes dashboard totals. |
| Accessibility | Semantic queries drive TDD. Shell provides skip link, route-heading focus, responsive navigation, inert loading state, retry/empty states, and a focus-trapped confirm dialog that restores trigger focus. |

## Contracts and Sequences

```ts
type Recovery = 'ready' | 'needs_seed' | 'unavailable'
interface RepositoryProviderValue { repositories: Repositories; revision: number; restore(): Promise<void> }
interface Clock { now(): ISODateTime; today(): ISODate }
interface IdGenerator { next(kind: 'supplier'|'category'|'invoice'|'line'|'payment'|'dailyIncome'): string }
```

```text
Save → repository validates draft/current envelope → calculate/derive → gateway atomic write
     → provider revision++ → hook refetch → active list/dashboard update
Failure → reject typed error → preserve stored envelope/revision → accessible retry/error UI
```

## File Plan

### Existing files to modify

| File | Planned change |
|---|---|
| `src/main.tsx` | Mount router/provider composition. |
| `src/App.tsx`, `src/App.test.tsx`, `src/index.css` | Replace foundation screen with shell and verified styles. |
| `vitest.config.ts`, `openspec/config.yaml` | Keep test/coverage gates synchronized. |
| `docs/sdd/EXECUTION_PLAN.md` | Synchronize completed milestones without changing paused auth scope. |

`src/types/domain.ts`, `src/types/domain.test.ts`, and `src/lib/supabase/` are existing read-only boundaries.

### Planned files to create

| Capability | Concrete files / symbols |
|---|---|
| repository-contracts | `src/modules/suppliers/SupplierRepository.ts`, `src/modules/categories/CategoryRepository.ts`, `src/modules/settings/SettingsRepository.ts`, `src/modules/invoices/InvoiceRepository.ts`, `src/modules/invoices/PaymentRepository.ts`, `src/modules/daily-income/DailyIncomeRepository.ts`; `src/test/contracts/supplierRepositoryContract.ts`, `src/test/contracts/categoryRepositoryContract.ts`, `src/test/contracts/settingsRepositoryContract.ts`, `src/test/contracts/invoiceRepositoryContract.ts`, `src/test/contracts/paymentRepositoryContract.ts`, `src/test/contracts/dailyIncomeRepositoryContract.ts`. |
| local-persistence, demo-seed | Concrete files under `src/infrastructure/local/`: `LocalStateSchema.ts`, `LocalStateGateway.ts`, `SeedData.ts`, `LocalSupplierRepository.ts`, `LocalCategoryRepository.ts`, `LocalSettingsRepository.ts`, `LocalInvoiceRepository.ts`, `LocalPaymentRepository.ts`, `LocalDailyIncomeRepository.ts`. |
| provider/hooks | `src/app/RepositoryProvider.tsx`, `src/app/useRepositories.ts`, `src/modules/suppliers/useSuppliers.ts`, `src/modules/categories/useCategories.ts`, `src/modules/settings/useSettings.ts`, `src/modules/invoices/useInvoices.ts`, `src/modules/invoices/usePayments.ts`, `src/modules/daily-income/useDailyIncomes.ts`. |
| shell/catalogs | `src/app/AppRouter.tsx`, `src/app/Layout.tsx`, `src/app/Sidebar.tsx`; `src/components/StateOverlay.tsx`, `src/components/ConfirmDialog.tsx`; `src/modules/suppliers/SupplierPage.tsx`, `src/modules/suppliers/SupplierForm.tsx`; `src/modules/categories/CategoryPage.tsx`, `src/modules/categories/CategoryForm.tsx`; `src/modules/settings/SettingsPage.tsx`, `src/modules/settings/SettingsForm.tsx`. |
| finance/invoices | `src/utils/finance.ts`, `dates.ts`, `validation.ts`; `src/modules/invoices/InvoiceListPage.tsx`, `InvoiceDetailPage.tsx`, `InvoiceForm.tsx`, `InvoiceLineEditor.tsx`, `PaymentForm.tsx`. |
| daily-income/dashboard | `src/modules/daily-income/DailyIncomePage.tsx`, `DailyIncomeForm.tsx`; `src/modules/dashboard/DashboardPage.tsx`, `dashboardAggregates.ts`, `DueAlerts.tsx`. |
| quality/docs | `src/integration/invoiceLifecycle.test.tsx`, `src/integration/persistenceRecovery.test.tsx`, `src/integration/dailyIncomeDashboard.test.tsx`; `docs/terminal-todo.md`, `docs/demo-script.md`, `docs/qa-exploratory/refresh-persistence.md`, `docs/qa-exploratory/corrupt-recovery.md`, `docs/qa-exploratory/responsive-layout.md`, `docs/qa-exploratory/keyboard-navigation.md`. |

## Testing, Delivery, and Rollback

Use strict RED→GREEN→REFACTOR: pure finance/date units, reusable repository contracts, provider-backed component tests, then real-gateway jsdom integration tests. G2 requires >=90% reachable branch coverage per supplier, category, and settings module; G3 applies the same >=90% reachable branch-coverage policy to invoice UI/core and local invoice/payment/daily-income adapters. Defensive guards unreachable through valid public UI states or requiring manually malformed persisted internals remain in production and are not force-tested. Each milestone runs tests and stays below 800 changed lines with tests/docs/TODO in the same work unit. GMVP retains build, lint, coverage, demo, QA charter closure, and final GLM 5.2 review.

Rollback MUST proceed in reverse dependency order: docs/UI/dashboard → features/finance → provider/local repositories → gateway/schema → contracts. Revert consumers before providers to remain compile-safe; clear an incompatible newer storage key or restore through the compatible gateway before reverting persistence. Supabase/auth remain paused and untouched.

## Open Questions

None.
