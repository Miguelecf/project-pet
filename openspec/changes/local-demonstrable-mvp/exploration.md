# Exploration: Local Demonstrable MVP (M0.2 → GMVP)

**Date**: 2026-08-10 (corrective rerun)
**Change**: `local-demonstrable-mvp`
**Explorer**: sdd-explore (deepseek-v4-pro)

## Current State

The project has a verified foundation (INF-0 ✅, M0.1 ✅, Q1 ✅) and is ready to build the complete local demonstrable MVP. The executed baseline consists of:

| Layer | Artifact | Lines |
|-------|----------|-------|
| Domain contracts | `src/types/domain.ts` — 14 financial invariants, branded IDs, discriminated Payment union | 158 |
| Domain contract tests | `src/types/domain.test.ts` — `expectTypeOf` structural tests | 72 |
| Supabase guards | `src/lib/supabase/guards.ts` — URL/key validation, service_role rejection | 73 |
| Supabase guard tests | `src/lib/supabase/__tests__/guards.test.ts` — 6 URL + 6 key tests | 77 |
| Supabase client | `src/lib/supabase/client.ts` — construction-time hardening | 37 |
| Supabase index | `src/lib/supabase/index.ts` — module re-exports, type-only re-exports | 10 |
| Module index | `src/modules/index.ts` — feature module map (8 modules declared, all empty) | 23 |
| App shell | `src/App.tsx` — foundation placeholder with demo badge, skip link, capabilities list | 86 |
| App tests | `src/App.test.tsx` — 3 semantic UI tests (Testing Library + jsdom) | 57 |
| Entry | `src/main.tsx` — StrictMode + createRoot | 10 |
| CSS | `src/index.css` — foundation design tokens, layout, responsive, reduced-motion | 71 |

**Quality baseline**: 20/20 tests pass (3 test files), build green, lint green. Coverage: 77.41% statements/lines, 91.66% branches, 100% functions.

**Measured total source lines**: 674 (`wc -l` across all `src/**/*.ts`, `src/**/*.tsx`, and `src/index.css`). Breakdown: 603 `.ts`/`.tsx` + 71 `.css`.

> **Corrective note**: The original exploration (2026-08-10) incorrectly reported `src/index.css` at ~1300 lines (actual: 71), omitted `lib/supabase/index.ts` (10 lines), and claimed ~1930 total source lines (actual: 674). The module count was also understated (7 instead of 8). All line counts in this artifact are direct `wc -l` measurements confirmed against the working tree. The corrected baseline shifts the final projected codebase from ~7000-7800 to ~5874-6474 lines.

## Affected Areas

All work is additive — no existing code is removed or changed, only extended.

### New files to create (by milestone)

| Milestone | New files | Domain |
|-----------|-----------|--------|
| M0.2 | `src/types/repository.ts`, `src/types/repository.test.ts` | Repository contracts + shared contract test functions |
| M0.3 | `src/modules/persistence/schema.ts`, `src/modules/persistence/adapter.ts`, `src/modules/persistence/seed.ts`, `src/modules/persistence/__tests__/adapter.test.ts` | localStorage adapter, versioned schema, seed data, restore |
| M1.1 | `src/modules/shell/Layout.tsx`, `src/modules/shell/AppRouter.tsx`, `src/modules/shell/Sidebar.tsx` | Router + layout + sidebar |
| M1.2 | `src/modules/shell/StateOverlay.tsx`, `src/modules/shell/ConfirmDialog.tsx`, `src/modules/shell/__tests__/Layout.test.tsx` | Transversal states, accessibility |
| M2.1 | `src/modules/suppliers/SuppliersPage.tsx`, `src/modules/suppliers/SupplierForm.tsx`, `src/modules/suppliers/__tests__/SuppliersPage.test.tsx` | Supplier CRUD + soft delete |
| M2.2 | `src/modules/categories/CategoriesPage.tsx`, `src/modules/categories/CategoryForm.tsx`, `src/modules/categories/__tests__/CategoriesPage.test.tsx` | Category CRUD + block delete |
| M2.3 | `src/modules/settings/SettingsPage.tsx`, `src/modules/settings/__tests__/SettingsPage.test.tsx` | Settings CRUD |
| M3.1 | `src/utils/finance.ts`, `src/utils/__tests__/finance.test.ts` | Pure financial rules |
| M3.2 | `src/modules/invoices/InvoiceForm.tsx`, `src/modules/invoices/InvoiceLineEditor.tsx` | Invoice create/edit |
| M3.3 | `src/modules/invoices/InvoicesPage.tsx`, `src/modules/invoices/InvoiceDetail.tsx` | Invoice list/detail |
| M3.4 | `src/modules/invoices/PaymentForm.tsx`, `src/modules/invoices/__tests__/InvoiceFlow.test.tsx` | Payments + void |
| M3.5 | `src/modules/invoices/DeleteInvoice.tsx` | Safe delete + restore |
| M3.6 | `src/modules/dashboard/OverdueAlert.tsx` | Due date widget |
| M4.1 | `src/modules/daily-income/DailyIncomePage.tsx`, `src/modules/daily-income/DailyIncomeForm.tsx` | Daily income CRUD |
| M4.2 | `src/modules/dashboard/DashboardPage.tsx`, `src/modules/dashboard/MetricsPanel.tsx` | Dashboard metrics |
| M4.3 | `docs/demo-script.md` | Demo guide (no code) |
| Q2-Q4 | Tests across all modules, gate config | Quality automation |
| Q5 | `.private-docs/qa-exploratory/` | QA charters (no code) |

### Existing files that grow

| File | Growth | Reason |
|------|--------|--------|
| `src/App.tsx` | +20 lines | Wrap with Router, integrate Layout |
| `src/main.tsx` | +5 lines | Router provider |
| `src/modules/index.ts` | +0 lines | No change needed; modules already declared |
| `package.json` | +0 lines | All dependencies already present (react-router-dom, etc.) |

## Architecture Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer (React)                     │
│  src/modules/shell/  src/modules/{feature}/              │
│  Pages, Forms, Lists, Dialogs                            │
│  ┌─────────────────────────────────────────────────────┐│
│  │         Application Services / Hooks                 ││
│  │    useSuppliers(), useInvoices(), useDashboard()     ││
│  │    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ││
│  │         Repository Contracts (M0.2)                  ││
│  │    src/types/repository.ts                           ││
│  │    ISupplierRepo, IInvoiceRepo, IPaymentRepo, ...    ││
│  ├───────────────────────┬─────────────────────────────┤│
│  │ Local Adapter (M0.3)  │   Future: Supabase Adapter   ││
│  │ localStorage + seed   │   (paused, not in MVP)       ││
│  └───────────────────────┴─────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│                    Domain Layer                           │
│  src/types/domain.ts — Pure types, zero runtime deps     │
│  src/utils/finance.ts — Pure functions (M3.1)            │
└─────────────────────────────────────────────────────────┘
```

### Boundary rules (enforced by architecture)

1. **UI never imports localStorage directly**. Pages/components call repository contracts via hooks.
2. **Repository contracts are per-module, not generic**. Each module gets the operations it needs — no `CrudRepository<T>` abstraction.
3. **Financial rules are pure functions** in `src/utils/finance.ts`. No React, no localStorage, no Supabase.
4. **Supabase isolation layer** (`src/lib/supabase/`) is preserved but not consumed during local MVP.
5. **Paused change boundary**: `openspec/changes/admin-managed-email-auth/` is read-only; no new work touches it.
6. **No branches, no remote pushes**. All work commits directly to `main`.

## Implementation Slices and Commit Strategy

### Milestone breakdown with line-count estimates

| Milestone | Activity | Est. New Lines | Guard Status | Delivery Strategy |
|-----------|----------|----------------|--------------|-------------------|
| **M0.2** | Repository contracts + contract tests | ~400 | ✅ Under 800 | Single commit |
| **M0.3** | Local adapter + seed + restore | ~1100 | ⚠️ Over 800 | Split into 2 commits: M0.3a (core + catalogs repos) + M0.3b (invoices/payments/income + seed) |
| **M1.1** | Router + layout + sidebar | ~260 | ✅ Under 800 | Single commit |
| **M1.2** | Transversal states + confirm dialog | ~250 | ✅ Under 800 | Single commit (or merge with M1.1 if total <800) |
| **M2.1** | Suppliers CRUD + soft delete | ~350 | ✅ Under 800 | Single commit |
| **M2.2** | Categories CRUD + block delete | ~200 | ✅ Under 800 | — |
| **M2.3** | Settings CRUD | ~200 | ✅ Under 800 | — |
| **G2-LOCAL** | Catalog gate verification | ~100 (tests) | — | Tests added to M2 commits |
| **M3.1** | Financial rules (pure) | ~350 | ✅ Under 800 | Single commit |
| **M3.2** | Invoice create/edit | ~450 | ✅ Under 800 | Single commit |
| **M3.3** | Invoice list/detail | ~350 | ✅ Under 800 | Single commit |
| **M3.4** | Payments + void | ~450 | ✅ Under 800 | Single commit |
| **M3.5** | Safe delete + restore | ~250 | ✅ Under 800 | Single commit |
| **M3.6** | Due dates + alert | ~250 | ✅ Under 800 | Single commit |
| **G3-LOCAL** | Core gate verification | ~100 (tests) | — | Tests added to M3 commits |
| **M4.1** | Daily income CRUD | ~350 | ✅ Under 800 | Single commit |
| **M4.2** | Dashboard + metrics | ~450 | ✅ Under 800 | Single commit |
| **M4.3** | Demo guide | ~150 (docs) | Non-code | Documentation only |
| **Q2** | Domain coverage tests | ~300 | — | Test additions |
| **Q3** | Integration tests | ~400 | — | Test additions |
| **Q4** | Gate automation | ~50 (config) | — | Config only |
| **Q5** | QA exploratory | 0 (docs) | — | `.private-docs/` only |
| **GMVP** | Gate closure | 0 | — | Verification only |

### Work-unit commit map per milestone

Each milestone produces one conventional commit. The commit message pattern:

```
feat(<scope>): <action> — <milestone-id>

- <bullet 1>
- <bullet 2>
```

Example: `feat(persistence): local adapter with versioned schema and seed data — M0.3a`

### Total estimates

- **Measured current baseline** (`wc -l`): 674 lines (603 `.ts`/`.tsx` + 71 `.css`)
- **New source lines** (`.ts` + `.tsx`): ~5200-5800 (estimated — unchanged from original exploration)
- **New test lines**: ~1900-2200 (included in new source lines above — tests are counted per milestone)
- **Projected final codebase**: ~5874-6474 lines
- **Number of commits**: ~20 (including gate/test commits)
- **Largest single commit**: ~450 lines (comfortably under 800 guard)

## Business-Rule Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Currency change after financial records exist** | CRITICAL | Enforced at Settings save: if invoices or daily-income records exist and have a different currency, reject the change with a clear message. Validate before save, not after. |
| **Overpayment through concurrent payments** | HIGH | Single-threaded local app eliminates race conditions, but the PaymentForm must validate `amountMinor ≤ remaining` at submission time against current state, not stale snapshots. |
| **Soft-delete with non-voided payments** | HIGH | Domain invariant #8: an invoice with non-voided payments cannot be soft- or hard-deleted. The repository must enforce this before marking `deletedAt`. |
| **Seed data inconsistency after domain changes** | MEDIUM | Seed data is versioned alongside the schema. A schema version bump triggers a seed data review checklist. Seed data must be regenerated if domain types change. |
| **Invoice status derived incorrectly** | MEDIUM | Status is a derived field, never stored. The derivation function in `src/utils/finance.ts` is the single source of truth. Every status display calls this function. |
| **Due date calculation across timezones** | LOW | All dates are `YYYY-MM-DD` strings. The comparison uses string-based date math in the local timezone, which is correct for a local-only app. Risk increases at productization. |

## Test Strategy

### Layer-specific approach

| Layer | Tool | Pattern | Scope |
|-------|------|---------|-------|
| **Domain types** | `expectTypeOf` (Vitest) | Structural type contracts | M0.1 ✅ |
| **Pure financial rules** | Vitest (node) | Table-driven input/output tests | M3.1 |
| **Repository contracts** | Vitest (node) | Shared contract test functions that accept any adapter | M0.2 |
| **Local adapter** | Vitest (node) | Run shared contract tests + schema/seed/restore edge cases | M0.3 |
| **UI components** | Testing Library + jsdom | Semantic queries (role, label, text). No implementation details. | All M1-M4 modules |
| **Integration flows** | Testing Library + jsdom | Multi-step flows: create → list → detail → pay → void | Q3 |
| **QA exploratory** | Manual charters | Structured sessions with severity tracking | Q5 |

### Contract test pattern (M0.2 design decision)

```typescript
// src/types/repository.test.ts
export function testSupplierRepo(makeRepo: () => ISupplierRepo) {
  describe('ISupplierRepo', () => {
    it('creates a supplier with unique normalized name', async () => {
      const repo = makeRepo()
      const supplier = await repo.create({ name: '  Proveedor Uno  ', defaultDueDays: 30 })
      expect(supplier.name).toBe('Proveedor Uno')
      expect(supplier.normalizedName).toBe('proveedor uno')
    })
    // ... shared tests for list, update, softDelete, restore
  })
}
```

Both the local adapter and the future Supabase adapter run the same `testSupplierRepo` — guaranteeing behavioral parity. Each adapter test file imports the shared test function and passes its own `makeRepo()` factory.

## Persistence Versioning

### Schema version strategy

```typescript
// src/modules/persistence/schema.ts
export const SCHEMA_VERSION = 1

interface PersistenceSchema {
  version: number
  settings: Settings | null
  suppliers: Supplier[]
  categories: Category[]
  invoices: Invoice[]
  invoiceLines: InvoiceLine[]
  payments: Payment[]
  dailyIncomes: DailyIncome[]
}
```

**Versioning rules**:
- `localStorage` key: `project-pet-v{version}`
- On load: if `version !== SCHEMA_VERSION`, offer recovery or seed reset
- On save: write `version: SCHEMA_VERSION` with every persist
- Defensive parse: empty, null, and malformed JSON all degrade gracefully to empty state + seed prompt
- Seed data is deterministic and versioned separately (a `SEED_DATA_VERSION` constant)

## UI Integration

### Routing architecture (M1.1)

```
/                        → DashboardPage
/invoices                → InvoicesPage
/invoices/:id            → InvoiceDetail
/invoices/new            → InvoiceForm
/invoices/:id/edit       → InvoiceForm
/income                  → DailyIncomePage
/suppliers               → SuppliersPage
/categories              → CategoriesPage
/settings                → SettingsPage
```

- `BrowserRouter` (not HashRouter — Netlify has SPA fallback)
- No `AuthGuard` wrapper (local MVP, no auth)
- Sidebar renders `<NavLink>` with active state
- Header shows "Local MVP · Demo mode" badge (already in App.tsx)

### Transversal state pattern (M1.2)

Every page follows a triple-state contract:

```typescript
type PageState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; data: T }
```

- `StateOverlay` component renders loading spinner, error with retry button, or children
- `ConfirmDialog` wraps destructive actions (delete, void, restore seed)
- Accessibility: all interactive elements have labels, focus management on modal open/close, keyboard navigation

## Demo Readiness

### Seed data design (M0.3/M4.3)

Seed data must:
1. Be deterministic — same data every time "Restore demo" is triggered
2. Include at least: 2 suppliers, 6 categories, 3 invoices (one pending, one partially_paid, one paid), 2 daily incomes, 1 overdue invoice
3. Use realistic but obviously fake data (no real supplier names, amounts, or dates that could be confused with real records)
4. Support the demo walkthrough: catalogs → invoice → payment → income → dashboard
5. Store no passwords, tokens, or secrets — verified by automated check

### Demo walkthrough (M4.3)

The `docs/demo-script.md` document guides the product owner through:
1. Open app → see dashboard with demo data
2. Navigate catalogs (suppliers, categories)
3. Create a new invoice with lines
4. Register a partial payment
5. Complete the payment → see status change
6. Void a payment → see reversal
7. Record daily income → see dashboard update
8. Restore demo data → verify determinism

## Realistic Line-Count and Reviewer Burden

### Verified current baseline (direct `wc -l` measurements)

| File | Lines |
|------|-------|
| `src/types/domain.ts` | 158 |
| `src/types/domain.test.ts` | 72 |
| `src/lib/supabase/guards.ts` | 73 |
| `src/lib/supabase/__tests__/guards.test.ts` | 77 |
| `src/lib/supabase/client.ts` | 37 |
| `src/lib/supabase/index.ts` | 10 |
| `src/modules/index.ts` | 23 |
| `src/App.tsx` | 86 |
| `src/App.test.tsx` | 57 |
| `src/main.tsx` | 10 |
| `src/index.css` | 71 |
| **Total** | **674** |

- 20 tests, 3 test files
- `npm run test:run`: ✅ 20/20 pass (~780ms)
- `npm run build`: ✅ (verified in PROJECT_CONTEXT.md)
- `npm run lint`: ✅ (verified in PROJECT_CONTEXT.md)
- Coverage: 77.41% stmts, 91.66% branches, 100% funcs

### Forecast per milestone

| Milestone | New Lines | Test Lines | Total Changed | Review Risk |
|-----------|-----------|------------|---------------|-------------|
| M0.2 | ~250 | ~150 | ~400 | Low |
| M0.3a | ~350 | ~150 | ~500 | Low |
| M0.3b | ~400 | ~200 | ~600 | Low |
| M1.1 | ~170 | ~90 | ~260 | Low |
| M1.2 | ~150 | ~100 | ~250 | Low |
| M2.1 | ~200 | ~150 | ~350 | Low |
| M2.2 | ~120 | ~80 | ~200 | Low |
| M2.3 | ~120 | ~80 | ~200 | Low |
| M3.1 | ~200 | ~150 | ~350 | Low |
| M3.2 | ~280 | ~170 | ~450 | Low |
| M3.3 | ~200 | ~150 | ~350 | Low |
| M3.4 | ~280 | ~170 | ~450 | Low |
| M3.5 | ~150 | ~100 | ~250 | Low |
| M3.6 | ~150 | ~100 | ~250 | Low |
| M4.1 | ~200 | ~150 | ~350 | Low |
| M4.2 | ~280 | ~170 | ~450 | Low |
| Q2 | ~0 | ~300 | ~300 | Low |
| Q3 | ~0 | ~400 | ~400 | Low |

**All individual milestones are under the 800-line guard**. No chained PRs are required at the milestone level — each commit is a self-contained work unit. The largest milestone (M0.3b at 600 lines) is still well within budget.

## Recommendation

Proceed with the milestone sequence as defined in the backlog:
```
M0.2 → M0.3a → M0.3b → M1.1 → M1.2 → M2.1 → M2.2 → M2.3 → G2-LOCAL
→ M3.1 → M3.2 → M3.3 → M3.4 → M3.5 → M3.6 → G3-LOCAL
→ M4.1 → M4.2 → M4.3
→ Q2 → Q3 → Q4 → Q5 → GMVP
```

**Each milestone is one commit on `main`**. No branches. No parallel work. Strict sequential execution.

The exploration confirms:
- **No architecture changes needed**. The existing domain contracts, module structure, and Supabase isolation layer are correctly designed for this path.
- **No external dependencies to add**. `react-router-dom` is already in `package.json`. `@supabase/supabase-js` is preserved but not used.
- **The paused `admin-managed-email-auth` change is fully isolated**. No files or decisions from that change affect the local MVP path.
- **Line-count risk is managed** by splitting M0.3 into two sub-milestones. All other milestones fit comfortably under 800 lines.
- **Corrected baseline**: 674 measured lines (not ~1930). The final projected codebase is ~5874-6474 lines (not ~7000-7800). Version 2.3.1 milestone estimates (future code) remain unchanged — only the arithmetic of baseline + future was wrong.

### Open questions for the spec phase

1. Should repository operations be async (return Promise) even though localStorage is synchronous? Decision: Yes — async by default prepares for Supabase, and the local adapter resolves immediately.
2. Should seed data be a separate JSON file or inline TypeScript? Recommendation: inline TypeScript for type safety during the local MVP; external file for productization.
3. What happens when a user changes currency in Settings after invoices exist? The backlog says "The business currency cannot change after financial records exist" — this must be enforced at the Settings save action.

## Risks

- **M0.3 line-count**: Split into M0.3a + M0.3b as recommended above. Without this split, a single M0.3 commit could reach ~1100 lines and breach the 800-line guard.
- **Contract test design pressure**: The shared contract test pattern must be designed once for all repos in M0.2. A poor design will cause rework across all modules. Get it right the first time — prefer explicit per-module test suites over an over-abstracted generic harness.
- **Finance function precision**: The `lineTotalMinor` rounding behavior must be validated with edge cases (0.005 rounding, large quantities × small unit costs). These tests must be in M3.1 before any UI touches invoice amounts.
- **Integration test gap**: Q3 requires "Refresh conserves state" and "corrupt data degrades with message". These are hard to test with jsdom alone (no real browser refresh). Mitigation: mock localStorage reset + re-render, or accept limited manual verification for refresh persistence.
- **Strict TDD velocity**: Every behavior starts with a failing test. This adds ~30% time overhead but eliminates regression risk. The trade-off is explicitly accepted by the backlog's execution rules.

## Ready for Proposal

**Yes**. The exploration confirms that the local MVP path is architecturally sound, the milestones fit within the review guard, the paused productization change is safely isolated, and no external blockers exist. Proceed to `sdd-propose` for this change.
