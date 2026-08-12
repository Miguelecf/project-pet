# Executable Delivery Plan

**M2.1 supplier CRUD and soft delete, M2.2 category CRUD with block-delete
protection, M2.3 settings CRUD with currency-lock enforcement, G2-LOCAL, M3.1
pure financial rules, M3.2 invoice create/edit forms, and M3.3 invoice list and
detail pages, and M3.4 payment registration and voiding are complete.** The next
executable unit is **M3.5: safe delete and restore**.

## Quick path

1. Begin M3.5 with RED tests for deletion and restore invariants.
2. Reuse payment-derived invoice state; do not duplicate financial rules.
3. Deliver one mainline milestone within the 800 changed-line review guard, then run all quality gates.

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
status and balance from those records. M3.5 is next.

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
