# Proposal: Local Demonstrable MVP (M0.2 → GMVP)

## Intent

Build the complete first local demonstrable MVP from M0.2 through GMVP on the
verified 674-line foundation (INF-0 ✅, M0.1 ✅, Q1 ✅). Deliver an
offline-capable, seed-driven demo that a product owner can walk through
end-to-end: catalog management → invoice lifecycle → payments/void → daily
income → dashboard. The change exercises the full Clean Architecture with async
per-module repository contracts, a versioned localStorage adapter, deterministic
seed data, pure financial rules, and strict TDD. No Supabase productization. No
auth.

## Users and Demo Situation

- **Primary user**: product owner performing a guided demo on a local machine.
- **Situation**: single-user, single-tab, browser-session scope. No multi-tenant,
  no concurrency, no network.
- **Demo path**: open app → see seeded dashboard → navigate catalogs → create
  invoice with lines → register partial payment → complete payment → void
  payment → record daily income → verify dashboard metrics → restore demo data.

## Scope

### In Scope — Milestone Sequence (M0.2 → GMVP)

| Milestone | Content | Est. Lines |
|-----------|---------|-------------|
| **M0.2** | Async per-module repository contracts + shared contract test functions | ~400 |
| **M0.3a** | LocalStorage adapter core + settings/suppliers/categories repos | ~500 |
| **M0.3b** | Invoices/payments/daily-income repos + seed data + restore | ~600 |
| **M1.1** | BrowserRouter, Layout, Sidebar, module route map | ~260 |
| **M1.2** | StateOverlay, ConfirmDialog, skip-link, focus management | ~250 |
| **M2.1** | Supplier CRUD + soft delete | ~350 |
| **M2.2** | Category CRUD + block-delete (reject if referenced) | ~200 |
| **M2.3** | Settings CRUD + currency-lock enforcement at save | ~200 |
| **G2-LOCAL** | Catalog gate: >=90% reachable branch coverage per M2 catalog module | ~100 |
| **M3.1** | Pure financial functions: lineTotalMinor, invoiceTotals, deriveStatus, rounding | ~350 |
| **M3.2** | Invoice create/edit form + line editor | ~450 |
| **M3.3** | Invoice list/detail pages | ~350 |
| **M3.4** | Payment form + void (domain invariants #4–#7) | ~450 |
| **M3.5** | Safe delete + restore (domain invariant #8) | ~250 |
| **M3.6** | Due-date alert widget on dashboard | ~250 |
| **G3-LOCAL** | Core gate: >=90% reachable branch coverage per core module | ~100 |
| **M4.1** | Daily income CRUD | ~350 |
| **M4.2** | Full dashboard: day/week/month filter, cash metrics, latest invoices, inactivity, category breakdown, DueAlerts, routing, accessibility | ~750 |
| **M4.3** | `docs/demo-script.md` — guided walkthrough (no code) | ~150 |
| **Q2** | Domain coverage: edge-case tests on financial rules + domain types | ~300 |
| **Q3** | Integration tests: multi-step flows, state conservation, corrupt-data recovery | ~400 |
| **Q4** | Gate config: `openspec/config.yaml` quality thresholds | ~50 |
| **Q5** | `docs/qa-exploratory/` — charters with severity tracking | 0 code |
| **GMVP** | GLM 5.2 final review, gate closure, full verification | 0 |

**Projected final codebase**: ~6174–6774 lines (674 baseline + ~5500–6100 new).
**All milestones target the 800 changed-line guard**. M4.2 is the largest remaining
milestone and MUST be split before implementation if tests plus production changes
would exceed the guard.
**~24 conventional commits on `main`**.

### Out of Scope

- Supabase productization (deferred; `src/lib/supabase/` preserved but unused)
- `admin-managed-email-auth` change (paused; read-only boundary)
- Auth (login, sessions, RLS, JWT)
- Multi-user, multi-tab, concurrency
- Remote database, Netlify deploy, CI/CD
- Import/export modules (`src/modules/import/`, `src/modules/export/`)
- Internationalization, accessibility audit beyond WCAG AA basics in M1.2

## Approach

### Architecture (from exploration, reaffirmed)

```
UI Layer (React pages/forms) --hooks-->  Repository Contracts (async, per-module)
                                                  |
       +------------------------------------------+-------------------------------+
       |                                          |                               |
LocalStorage Adapter                  Future: Supabase Adapter           Pure Domain Layer
(versioned, seedable)                 (deferred, not in MVP)             (types + finance.ts)
```

**Boundary rules**: UI never imports localStorage directly. Repository contracts
return `Promise`. No `CrudRepository<T>` — each module defines its own
interface. Financial rules are pure functions with zero dependencies.

### Decision Resolutions (from exploration)

| Decision | Resolution |
|----------|------------|
| Async per-module repos | All methods return `Promise`. Local adapter resolves via `Promise.resolve()`. Prepares contract shape for Supabase without runtime cost. |
| Versioned persistence | Key: `project-pet-v{SCHEMA_VERSION}`. Defensive parse on null/empty/malformed/mismatch — degrade to empty state + seed prompt. No auto-migration during MVP. |
| Deterministic seeds | Inline TS constant `SEED_DATA` with `SEED_DATA_VERSION`. 2 suppliers, 6 categories, 3 invoices (`pending`/`partially_paid`/`paid`), 2 daily incomes, 1 overdue. No real names/amounts. |
| Currency lock | Reject Settings save if any invoice/daily-income exists with a different currency. Checked before mutation. User-facing error message. |
| Financial precision | Integer minor units (`amountMinor: number`). Rounding validated in M3.1 with 0.005 and large-quantity edge cases before any UI touches amounts. |
| Deletion/payment invariants | Invariant #8: invoice with non-voided payments cannot be soft- or hard-deleted. Payments must be voided first. Categories: block-delete if referenced by any invoice line. |
| Manual QA boundaries | Q5 charters under `docs/qa-exploratory/` with session sheets, severity tracking, coverage maps. No automated E2E. Manual coverage: refresh persistence, corrupt recovery, 320px/1920px layout, keyboard-only nav. |
| M4.2 period semantics | The injected local calendar date controls inclusive day, Monday–Sunday week, and calendar-month boundaries. ISO record dates are compared lexically; browser/UTC conversion is forbidden. |
| M4.2 cash semantics | Period income is daily income by `saleDate`; paid expenses are non-voided payments by `paymentDate`; estimated cash result is income minus paid expenses and is explicitly not net profit. Outstanding is an all-time active-invoice snapshot. |
| M4.2 attribution | Each period payment is allocated across its active invoice lines in proportion to rounded line totals. Floor shares first; distribute residual minor units by line position then line ID so category totals reconcile exactly. |
| M4.2 exclusions | Soft-deleted invoices and all of their payments are excluded. Voided payments are excluded. Deleted daily incomes are absent by definition. Latest invoices and status counts use active invoices only. |
| M4.2 inactivity | Show an alert when no daily income exists in the inclusive seven-date window ending on local today; dismiss automatically when any income enters that window. |

## Mainline Commit Strategy

- **Direct `main` commits only**. No branches, no PRs, no remote pushes.
- **One conventional commit per milestone**: `feat(<scope>): <action> — <milestone-id>`.
  Body lists key behaviors in bullet form.
- Code and tests committed together per milestone — no separate test commits.
- **Terminal TODO** (`docs/terminal-todo.md`): ordered milestone checklist with
  `[ ]`/`[x]` checkboxes, updated on every commit.
- **800-line guard enforced per milestone**. M0.3 is pre-split into a/b. If any
  milestone drifts toward 800, stop and split before commit.

## Documentation and Plan Synchronization

| Artifact | When | Purpose |
|----------|------|---------|
| `docs/terminal-todo.md` | M0.2, then every commit | Running ordered milestone checklist |
| `docs/demo-script.md` | M4.3 | Guided product-owner walkthrough |
| `docs/qa-exploratory/` | Q5 | Structured charters, session sheets, severity tracking |
| `openspec/.../state.yaml` | Orchestrator | Phase DAG state |
| `openspec/.../specs/` | sdd-spec | Delta specs per capability |
| `openspec/.../design.md` | sdd-design | Technical design |
| `openspec/.../tasks.md` | sdd-tasks | Implementation tasks |
| `openspec/.../verify-report.md` | sdd-verify | Verification evidence |

## Strict TDD

- **RED-GREEN-REFACTOR for every behavior**. No production code without a failing
  test first.
- Contract test functions in M0.2 run against both local and future adapters —
  guaranteeing behavioral parity.
- Pure function tests in M3.1 are table-driven with explicit input/output pairs.
- UI tests use semantic queries (`getByRole`, `getByLabelText`) — no
  implementation detail selectors.
- `npm run test:run` must be green at every commit. Coverage tracked but not a
  hard gate until Q4.

## GLM 5.2 Final Review (GMVP)

After all milestones pass gates (G2-LOCAL, G3-LOCAL, Q2–Q5):

1. **GLM 5.2 code review** of all source files in `src/`, `docs/`, `openspec/`.
2. **Gate verification**: confirm `npm run test:run`, `npm run build`,
   `npm run lint`, `npm run test:coverage` all pass.
3. **Demo walkthrough**: execute `docs/demo-script.md` end-to-end against a fresh
   browser session.
4. **QA charter closure**: all Q5 charters complete, severity findings resolved
   or accepted.
5. **Memory persistence**: final state saved as `sdd/local-demonstrable-mvp/verify`.

No code changes during GMVP — verification and review only.

## Rollback Plan

Milestones form a dependency chain, so rollback MUST revert in reverse dependency
order: UI/dashboard/docs → feature repositories and financial rules → provider and
local repositories → gateway/schema → repository contracts. A revert boundary is
compile-safe only when its consumers have already been reverted; tests stay with
their production work unit. If a persisted schema is rolled back, clear the newer
versioned key or restore the seed through the still-compatible gateway before
reverting that gateway. `package.json` requires no new dependency rollback.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| M0.3b line-count exceeds 600 | Low | Already pre-split from single ~1100-line milestone |
| Contract test design locks in wrong abstractions | Medium | Per-module interfaces, not generic; contract tests per module, not one uber-harness |
| Finance rounding edge cases missed | Medium | M3.1 must test 0.005 rounding, large qty × small unit cost before UI touches amounts |
| Currency-lock rejected save confuses user | Low | Clear error message in Settings form; tested in M2.3 |
| Integration test gap (no real browser refresh) | Low | Mock localStorage reset + re-render; manual verification for actual refresh persistence |
| Seed data feels real to demo audience | Low | Review seed values for realism; use obviously fake names and round amounts |
| GLM 5.2 review surface is large | Medium | Review per-module, not all-at-once; use gate checkpoints at G2-LOCAL and G3-LOCAL are partial reviews |

## Success Criteria

- [ ] All 24 milestones committed to `main` with green `npm run test:run` at each.
- [ ] `docs/demo-script.md` walkthrough executes without deviation from expected behavior.
- [ ] Every repository contract has a shared test function that passes against the local adapter.
- [ ] Currency lock enforced: changing Settings currency with financial records shows error and rejects save.
- [ ] Domain invariant #8 enforced: invoice with non-voided payments rejects soft/hard-delete.
- [ ] `npm run build` and `npm run lint` pass at GMVP.
- [ ] GMVP passes final GLM 5.2 code review with no unresolved findings.
- [ ] `docs/terminal-todo.md` shows all milestones `[x]` at project completion.
- [ ] No files modified under `openspec/changes/admin-managed-email-auth/` or `src/lib/supabase/`.

## Capabilities

### New Capabilities

All 12 capabilities are new (`openspec/specs/` is empty at proposal time):

- `repository-contracts`: async per-module repository interfaces with shared contract test functions.
- `local-persistence`: versioned localStorage adapter, defensive parse, deterministic seed/restore.
- `app-shell`: BrowserRouter, Layout, Sidebar, StateOverlay, ConfirmDialog, skip-link, focus management.
- `supplier-management`: CRUD with soft-delete, normalized-name uniqueness.
- `category-management`: CRUD with block-delete (reject if referenced by invoice lines).
- `settings-management`: CRUD with currency-lock enforcement on save.
- `financial-rules`: pure functions for `lineTotalMinor`, `invoiceTotals`, `deriveStatus`, rounding.
- `invoice-management`: CRUD with lines, payment/void (invariants #4–#7), safe-delete/restore (invariant #8).
- `daily-income-management`: persistent CRUD for dated positive income records, including dashboard refresh.
- `dashboard`: day/week/month dashboard; outstanding, period income, paid expenses,
  estimated cash result disclosure, active status counts, weekly income summary,
  latest 10 invoices, inactivity alert, numeric paid-expense category breakdown,
  due-date alerts, root routing, and accessibility.
- `demo-seed`: deterministic inline seed data with restore/reset, demo walkthrough guide.
- `quality-gates`: domain coverage tests, integration tests, exploratory QA charters, gate automation.

### Modified Capabilities

None — all work is additive on the verified baseline. INF-0, M0.1, and Q1 are
preserved as-is.

## Dependencies

- **react-router-dom** already in `package.json` (verified). No new dependencies.
- No external services, APIs, or network calls required.

## Preserved Baseline (read-only)

| Artifact | Status | Action |
|----------|--------|--------|
| INF-0 (project init) | ✅ Verified | No touch |
| M0.1 (domain contracts) | ✅ Verified | No touch |
| Q1 (contract tests) | ✅ Verified | No touch |
| `src/lib/supabase/` | ✅ Verified | Preserved, not imported |
| `openspec/changes/admin-managed-email-auth/` | Paused | Read-only boundary |
