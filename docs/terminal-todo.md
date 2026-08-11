# Terminal TODO — Local Demonstrable MVP

> Persistent milestone checklist. Updated on every milestone commit.
> Source of truth: `openspec/changes/local-demonstrable-mvp/tasks.md`

## Status: 🟡 In Progress

---

## Foundation

- [x] **M0.2** — Async per-module repository interfaces + executable contract/conformance suites (coverage gate complete; `size:exception` approved)
- [x] **M0.3a** — Versioned LocalStateSchema + defensive/atomic gateway + settings/supplier/category local repos (~500 lines)
- [ ] **M0.3b** — Invoice/payment/daily-income local repos + seed data + restore (~620 lines)

## App Shell

- [ ] **M1.1** — BrowserRouter, Layout, Sidebar navigation (~260 lines)
- [ ] **M1.2** — StateOverlay, ConfirmDialog, skip-link, focus management (~250 lines)

## Catalog Modules

- [ ] **M2.1** — Supplier CRUD + soft delete (~430 lines)
- [ ] **M2.2** — Category CRUD + block-delete (~240 lines)
- [ ] **M2.3** — Settings CRUD + currency-lock (~240 lines)
- [ ] **G2-LOCAL** — Catalog gate: 100% branch coverage on M2 modules (~100 lines)

## Core Financial Modules

- [ ] **M3.1** — Pure financial functions: lineTotalMinor, invoiceTotals, deriveStatus, rounding (~350 lines)
- [ ] **M3.2** — Invoice create/edit form + line editor (~500 lines)
- [ ] **M3.3** — Invoice list/detail pages (~350 lines)
- [ ] **M3.4** — Payment form + void (invariants #4–#7) (~490 lines)
- [ ] **M3.5** — Safe delete + restore (invariant #8) (~250 lines)
- [ ] **M3.6** — Due-date alert widget on dashboard (~250 lines)
- [ ] **G3-LOCAL** — Core gate: 100% branch coverage on M3 modules (~100 lines)

## Dashboard and Daily Income

- [ ] **M4.1** — Daily income CRUD (~390 lines)
- [ ] **M4.2** — Dashboard page + metrics panel (~450 lines)
- [ ] **M4.3** — `docs/demo-script.md` guided walkthrough (~150 lines, no code)

## Quality Gates

- [ ] **Q2** — Domain coverage: edge-case tests on financial rules (~300 lines)
- [ ] **Q3** — Integration tests: multi-step flows, state conservation, corrupt recovery (~400 lines)
- [ ] **Q4** — Gate config: `openspec/config.yaml` quality thresholds (~50 lines)
- [ ] **Q5** — `docs/qa-exploratory/` charters with severity tracking (0 code)

## Final Review

- [ ] **GMVP** — GLM 5.2 final review, gate closure, full verification (0 code)

---

## Progress

| Completed | Total | % |
|-----------|-------|---|
| 2 | 24 | 8% |

## Preserved Boundaries (read-only)

- `src/types/domain.ts` — baseline domain contracts (M0.1)
- `src/types/domain.test.ts` — baseline type tests (Q1)
- `src/lib/supabase/` — paused Supabase boundary
- `openspec/changes/admin-managed-email-auth/` — paused auth change
