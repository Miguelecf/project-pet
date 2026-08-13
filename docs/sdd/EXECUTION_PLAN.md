# Executable Delivery Plan

**M2.1 supplier CRUD and soft delete, M2.2 category CRUD with block-delete
protection, M2.3 settings CRUD with currency-lock enforcement, G2-LOCAL, M3.1
pure financial rules, M3.2 invoice create/edit forms, and M3.3 invoice list and
 detail pages, M3.4 payment registration and voiding, and M3.5 safe delete and
 restore, M3.6 due-date alerts, M4.1 daily-income CRUD, and M4.2 full dashboard
are complete.** M4.3 is complete with the client-facing guided demo script; Q2
domain coverage edge-case tests, Q3 integration tests, and Q4 gate configuration are
complete. **Q5: exploratory QA charters** is complete; the remaining executable
unit is **GMVP final review**.

## Quick path

1. Execute the five planned Q5 sessions in a real browser and record results.
2. Keep G2-LOCAL/G3-LOCAL reachable coverage policies and defensive guards intact.
3. Run GMVP final review only after Q5 findings meet their acceptance gates.

### Completed — Q4 gate configuration

- [x] Enable the Vitest integration-test capability in `openspec/config.yaml` to
  reflect Q3's real local-adapter and `RepositoryProvider` scenarios; browser E2E
  remains unavailable.
- [x] Declare test, coverage, build, lint, and `git diff --check` commands in the
  SDD configuration while retaining `strict_tdd: true`.
- [x] Retain Vitest `allowOnly: false` as the executable focused-test guard.
- [x] Document coverage correctly: no global percentage is enforced; G2-LOCAL and
  G3-LOCAL require >=90% reachable V8 branch coverage only for their approved modules.

**Q4 exit criteria met:** configuration metadata accurately matches available test
layers and all quality gate commands. Global coverage remains informational, avoiding
a false threshold that would contradict the approved reachable module policies.

### Completed — Q5 exploratory QA charters

- [x] Create session sheets for refresh persistence, corrupt recovery, responsive
  layout at 320px/1920px, keyboard-only navigation, and the client demo.
- [x] Include date, build, commit, owner/status, objective, setup, checks, expected
  results, evidence/result fields, and severity tracking in every sheet.
- [x] Use the closure gate of zero BLOCKER/CRITICAL findings and MAJOR findings
  resolved or explicitly accepted.

**Q5 exit criteria met:** the five English QA documents are planning artifacts only;
all result fields truthfully state that manual execution has not occurred. GMVP is
next and must execute the sheets in a real browser before final closure.

### Completed — Q3 integration tests

- [x] Exercise invoice creation, partial and full payment, payment voiding,
  soft deletion, retained filtering, and restoration through real provider and local
  repository contracts with deterministic IDs.
- [x] Prove invalid JSON and parseable malformed persisted envelopes degrade to the
  accessible empty dashboard/seed prompt without a crash; prove sequential income
  create/edit/delete mutations preserve the remaining envelope state.
- [x] Prove a daily-income create, edit, and delete refresh day metrics through the
  real `RepositoryProvider` revision.

**Q3 exit criteria met:** five integration scenarios use `MemoryStorage`, real local
adapters, and semantic rendered assertions where UI is involved. No production
behavior changed. A browser-refresh claim is intentionally out of scope because
jsdom does not perform a real browser refresh; gateway persistence and provider
remount contracts remain the executable evidence. Focused integration tests pass
5/5; the full suite passes 326 with one pre-existing skipped mutation-harness test;
coverage, build, lint, and diff checks pass. Q4 is next.

### Completed — M4.3 guided demo script

- [x] Add the dashboard's client-accessible `Restore demo data` control through
  `RepositoryProvider.restore()` with shared confirmation, revision refresh, and
  generic success/error/retry feedback.
- [x] Create the English client-facing walkthrough in `docs/demo-script.md` with
  local-only/no-account/no-cloud disclosure, deterministic fake-data preconditions,
  all lifecycle steps, dashboard interpretation, visible restore confirmation,
  recovery notes, expected results, and client validation questions.
- [x] Check that the document contains no fenced code blocks or implementation details.

**M4.3 exit criteria met:** a product owner can run the local-only, deterministic
fake-data walkthrough from the seeded dashboard through invoice, payment, void, and
daily-income actions, validate dashboard semantics, and recover through the visible
confirmed restore action. Q2 is next.

### Completed — Q2 domain coverage edge cases

- [x] Confirm half-up rounding at `0.005` and `1.005`, exact `10000 × 5` minor-unit
  arithmetic, zero/negative quantity rejection, negative money rejection, and
  quantities with more than three decimal places.
- [x] Confirm `deriveStatus` rejects overpayment and the local payment contract
  rejects overpayment both before any payment and after a partial payment while
  preserving pending, partially paid, and paid states.
- [x] Add the missing compile-time separation tests for `ISODate`, `MoneyMinor`, and
  `Quantity`; existing exact currency/status union and strict calendar ISO-date tests
  remain the source of evidence for those contracts.

**Q2 exit criteria met:** edge-case requirements are covered by focused finance,
validation, date, local-payment-contract, and domain-type tests. Only the missing
branded primitive assertions were added; no production behavior changed. Q2
introduced no skipped or disabled tests; the one intentional pre-existing `it.skip`
remains at `src/test/contracts/repositoryContracts.mutant.test.ts:13` for the
mutation harness. Commit `d324f31` churn is 88 changed lines (79 additions,
9 deletions), within the 800-line milestone guard. Q3 is next.

- [x] Reviewed V8 branch coverage: `src/modules/invoices` 96.73% (178/184); local invoice, payment, and daily-income repositories 100%, 91.30%, and 100% respectively.
- [x] Added meaningful adapter and invoice UI error/retry/fallback, persistence, state-transition, filtering, date/default-clock, optional-input, client-navigation, and async-unmount tests without changing product behavior.
- [x] Final sequential gates: focused core tests 65/65; full suite 292 passed, 1 skipped; coverage 292 passed, 1 skipped; build, lint, and diff check passed.
- [x] G3-LOCAL meets the approved >=90% reachable branch-coverage policy per core module: invoice UI/core 96.73%, local invoice 100%, local payment 91.30%, and local daily-income 100%.
- [x] Defensive guards remain intentionally uncovered when they require impossible public UI states, non-`Error` internal-validator failures, or manually malformed persisted internals. No production behavior was changed merely to increase coverage.

### Completed — M4.1 daily-income CRUD

- [x] Load daily incomes through a revision-aware repository hook and sort persisted records by descending sale date.
- [x] Create and edit through routed, accessible forms with positive-integer amount, non-future ISO sale-date, unique-date, optional-note, and currency-snapshot feedback.
- [x] Confirm hard deletion; cancellation retains the persisted record while successful local mutations publish the provider revision and refresh consumers.
- [x] Keep dashboard metrics and weekly-summary implementation deferred to M4.2.

**M4.1 exit criteria met:** daily-income list/create/edit/delete uses only
`RepositoryProvider` and existing local adapters, provides loading/error/retry/empty
states, and persists/reloads form changes without direct storage access.

### Completed — M4.2 full operational dashboard

- [x] Filter period-dependent values by inclusive local day, Monday–Sunday week,
  or calendar month; default to month and avoid UTC conversion of ISO dates.
- [x] Calculate period income, non-voided paid expenses, and estimated cash result
  (`income - paid expenses`) with an explicit “not net profit” disclosure.
- [x] Keep outstanding debt, active status counts, latest 10 active invoices, and
  `DueAlerts` as all-time snapshots; keep the weekly summary on the current week.
- [x] Alert after seven inclusive local dates without daily income and allocate
  period payments numerically across categories with deterministic integer remainders.
- [x] Preserve `/` as the accessible landing route and provide labeled zero,
  empty, loading, error/retry, and seed-prompt states.

**M4.2 exit criteria met:** the provider-backed root dashboard derives the specified
period and all-time views from existing repositories, refreshes after real mutations,
and preserves DueAlerts plus accessible loading/error/empty states. Soft-deleted
invoices and their payments are excluded;
voided payments are excluded; latest ties use issue date descending, creation instant
descending, then ID ascending. M4.1 stays complete; M4.3 and Q2+ stay pending.

## Operating rules

| Rule | Decision |
| --- | --- |
| Execution mode | Automatic |
| Artifact store | Hybrid: OpenSpec and Engram |
| Delivery | Directly on `main`; milestone commits only; no branches |
| Review budget | 800 changed lines per milestone |
| Artifact language | English |
| Product implementation in this initialization | Explicitly out of scope |

## Persistent TODOs

### Completed — M0.2 repository contracts

- [x] Create an OpenSpec change for local repository contracts and persist its SDD artifacts in Engram.
- [x] Define module-facing repository operations for settings, suppliers, categories, invoices, payments, and daily income.
- [x] Keep repository contracts independent of `localStorage` and the Supabase client.
- [x] Create reusable, executable contract tests for local and future Supabase adapters.
- [x] Verify domain contracts remain independent of React and infrastructure.
- [x] Run focused contract tests plus tests, coverage, lint, and build; record reproducible evidence in apply progress.
- [x] Correct the M0.2 contract gate: real category invoice-line references,
  complete settings defaults, persisted payment balance/status, and observable CRUD lists.
- [x] Prove representative broken test-only adapters fail the shared contracts
  before retaining M0.2 completion.

**Exit criteria met:** UI-facing code depends only on module repositories/services,
and the adapter contract suite executes against completed M0.3a local adapters.

### Completed — M0.3a local persistence core and catalog adapters

- [x] Implement a versioned local schema behind the M0.2 contracts.
- [x] Defensively recover from empty, malformed, or incompatible persisted JSON.
- [x] Run supplier, category, and settings contracts against local adapters.
- [x] Prove empty, malformed, incompatible, and failed-write recovery with automated tests.

**Exit criteria met:** catalog data survives refresh and recovery behavior is proven. Seed restore remains M0.3b.

### Completed — M0.3b persistence completion

- [x] Implement invoice, payment, and daily-income local adapters.
- [x] Add deterministic seed loading and restore behavior.
- [x] Run the remaining local adapter contracts.

**Exit criteria met:** all six repository contracts have local adapters; seed and
restore write validated deep copies through the atomic gateway.

### Then — M1 local shell and navigation

- [x] Add dashboard, invoices, income, suppliers, categories, and settings routes without an auth guard.
- [x] Clearly label the product as local demo mode.
- [x] Cover loading, empty, error, focus, keyboard, and destructive-action confirmation states in M1.2.

**M1.1 exit criteria met:** every local route is usable without a full reload and uses an honest placeholder until its module milestone.

**M1.2 exit criteria met:** async states expose inert loading content, actionable
error/empty states, dialogs keep keyboard focus contained and restore their
trigger, and navigation/skip links move focus to the intended content.

### Completed — M2.1 supplier catalog

- [x] Provide real local repositories through a revision-aware provider and restore hook.
- [x] List active suppliers with accessible empty, error/retry, edit, and delete actions.
- [x] Create and edit normalized unique supplier names; confirm soft deletion before mutation.

**M2.1 exit criteria met:** supplier mutations refresh consumers only after a
successful local write, and restore publishes a refetch revision.

### Completed — M2.2 category catalog

- [x] List categories with accessible loading, error/retry, empty, create, edit, and delete actions.
- [x] Create and edit trimmed, normalized unique category names through the real local repository.
- [x] Block deletion before confirmation when invoice-line references exist, showing their exact count; delete unreferenced categories only after confirmation.

**M2.2 exit criteria met:** category mutations publish a provider revision only
after successful local writes, while referenced categories remain intact with an
explicit reference-count message.

### Completed — M2.3 settings

- [x] Load the complete local settings singleton through RepositoryProvider.
- [x] Save validated ARS/USD currency and non-negative whole due-alert days.
- [x] Reject currency changes before persistence when invoice or daily-income records use another currency; identify both record types when both apply.
- [x] Confirm successful persistence and reload through accessible form controls and status feedback.

**M2.3 exit criteria met:** rejected saves preserve persisted settings, while
successful saves publish a revision and reload the saved local values.

### Completed — G2-LOCAL catalog coverage gate

- [x] Add meaningful reachable error, retry, cancellation, navigation, and mutation-path tests for supplier, category, and settings modules.
- [x] Reach >=90% branch coverage per catalog module: suppliers 94.44%, categories 96.87%, settings 95.45%.
- [x] Retain unreachable defensive guards rather than changing product behavior to execute invalid internal states.
- [x] Run catalog-focused tests, full tests, coverage, build, lint, and diff checks sequentially.

**G2-LOCAL exit criteria met:** each catalog module satisfies the documented >=90%
reachable branch-coverage threshold; M3.1 may proceed.

### Completed — M3.1 pure financial rules

- [x] Add table-driven unit tests before production code for financial, date, and validation boundaries.
- [x] Calculate line totals with thousandths normalization, one half-up round, and safe-integer guards.
- [x] Aggregate rounded line totals and derive only pending, partially paid, or paid status while rejecting overpayment.
- [x] Validate strict calendar ISO dates through an injected clock; due dates alone may be future.

**M3.1 exit criteria met:** pure dependency-free utilities provide deterministic
financial calculations and runtime validation without React, storage, adapters,
or remote dependencies.

### Completed — M3.2 invoice create and edit forms

- [x] Load invoices through a revision-aware repository hook and route only create/edit forms.
- [x] Create invoices with supplier/category IDs, required product references and descriptions, optional external SKU, and at least one valid line.
- [x] Reuse pure M3.1 quantity, minor-unit, date, and finance calculations for accessible validation and line totals.
- [x] Block and disable editing whenever a non-voided payment exists; keep list/detail/payment UI deferred.

**M3.2 exit criteria met:** the real local provider supplies form catalogs and
repositories; create/edit inputs are validated before persistence and active
payments prevent editing.

### Completed — M3.3 invoice list and detail pages

- [x] List active invoices with payment-derived pending, partially paid, and paid status badges.
- [x] Navigate client-side from the list to supplier/category contextual invoice details.
- [x] Display lines, payment history, totals, paid amount, balance, and a payment-derived status.
- [x] Offer edit only when no active payment exists; expose loading, error/retry, and not-found states.

**M3.3 exit criteria met:** invoice browsing is fully provider/repository-backed,
with no direct storage access or manual status state; payment registration,
voiding, deletion, restore, and due-date alerts remain deferred.

### Completed — M3.4 payment registration and voiding

- [x] Load payment history and balance through a revision-aware provider hook.
- [x] Expose payment-load failures with a semantic production retry control that refreshes the hook and restores payment controls/status.
- [x] Register only positive integer-minor payments dated no later than today and never above the current remaining balance.
- [x] Require a non-empty void reason and confirmation; cancellation does not mutate the payment.
- [x] Refresh provider-backed invoice detail payment history, balance, and derived status after registration or voiding.

**M3.4 exit criteria met:** the payment UI uses `PaymentRepository` through
`RepositoryProvider`; load failures offer a real retry action, local persistence
 records registration and one-way voids, and the detail page derives its refreshed
 status and balance from those records.

### Completed — M3.5 safe delete and restore

- [x] Confirm invoice soft deletion from detail; cancellation leaves storage unchanged.
- [x] Block deletion when any payment remains active with the exact invariant message.
- [x] Permit deletion after all payments are voided, then return to the active list.
- [x] Show retained invoices only through an explicit deleted filter and confirm restore.
- [x] Prove local-provider persistence clears `deletedAt` and returns restored invoices to active results.

**M3.5 exit criteria met:** deletion uses the existing repository invariant, retains
data for recovery, and provides accessible confirmation, errors, filtering, and
restoration without direct storage access. M3.6 is next.

### Completed — M3.6 due-date alerts

- [x] Derive active invoice balances from provider-backed payment records and exclude paid or retained invoices.
- [x] Classify dates against the injected clock and the persisted `dueAlertDays` setting, including the exact boundary.
- [x] Render accessible text badges and a semantic alert list; overdue visual treatment supplements, never replaces, text.
- [x] Navigate alert entries client-side to their invoice detail pages.

**M3.6 exit criteria met:** the existing dashboard placeholder now displays only
provider-backed overdue or due-soon active invoices, with fixed-clock component
coverage and no dashboard metrics, daily-income UI, storage, Supabase, domain, or
auth changes. G3-LOCAL is next.

### Completed — G3-LOCAL core coverage gate

- [x] Preserve meaningful reachable-path coverage for invoice UI/core and local invoice, payment, and daily-income adapters.
- [x] Meet the approved >=90% reachable V8 branch threshold in every core module: 96.73%, 100%, 91.30%, and 100%, respectively.
- [x] Keep defensive guards that require impossible UI states or manually malformed persisted internals instead of changing production behavior or adding invalid-state tests.
- [x] Run focused 65/65, full 292 passed/1 skipped, coverage 292 passed/1 skipped, build, lint, and diff checks sequentially.

**G3-LOCAL exit criteria met:** all relevant core modules satisfy the approved
reachable branch-coverage policy. At this historical checkpoint, M4.1 daily-income
CRUD was next.

### Deferred — productization

- [ ] Resume `admin-managed-email-auth` only after local MVP validation is complete or explicitly reprioritized.
- [ ] Add Supabase schema, RLS, and replaceable Supabase adapters after local contracts have proven stable.
- [ ] Configure real auth, SMTP, and Netlify release gates only for external users.

## Milestone closure checklist

- [ ] Scope is contained; no unrelated productization work entered the milestone.
- [ ] Changed lines do not exceed 800. If they do, split before review.
- [ ] A conventional milestone commit is created on `main` after all requested gates pass.
- [ ] `npm run test:run` passes with no focused tests (`allowOnly: false`).
- [ ] `npm run test:coverage`, `npm run lint`, and `npm run build` pass.
- [ ] OpenSpec task state, this plan, and Engram progress describe the same status.

## Reference map

| Source | Use |
| --- | --- |
| `openspec/config.yaml` | Enforce SDD and testing rules |
| `docs/sdd/PROJECT_CONTEXT.md` | Current stack, architecture, and capability baseline |
| `.private-docs/backlog/actividades.md` | Detailed local-MVP business backlog and gate definitions |
| `openspec/changes/admin-managed-email-auth/` | Paused productization change; preserve without advancing it |
