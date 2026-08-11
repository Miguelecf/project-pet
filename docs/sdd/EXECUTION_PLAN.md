# Executable Delivery Plan

**M0.3a local persistence core and catalog adapters is complete.** The next
executable unit is **M0.3b: invoice/payment/daily-income adapters, seed data, and restore**.

## Quick path

1. Implement the remaining local adapters behind the completed persistence gateway.
2. Add deterministic seed and restore behavior only in M0.3b.
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

**Exit criteria:** UI-facing code depends only on module repositories/services, and
the adapter contract suite can be executed against each implementation. M0.3 has
not started.

### Completed — M0.3a local persistence core and catalog adapters

- [x] Implement a versioned local schema behind the M0.2 contracts.
- [x] Defensively recover from empty, malformed, or incompatible persisted JSON.
- [x] Run supplier, category, and settings contracts against local adapters.
- [x] Prove empty, malformed, incompatible, and failed-write recovery with automated tests.

**Exit criteria met:** catalog data survives refresh and recovery behavior is proven. Seed restore remains M0.3b.

### Next — M0.3b persistence completion

- [ ] Implement invoice, payment, and daily-income local adapters.
- [ ] Add deterministic seed loading and restore behavior.
- [ ] Run the remaining local adapter contracts.

### Then — M1 local shell and navigation

- [ ] Add dashboard, invoices, income, suppliers, and categories routes without an auth guard.
- [ ] Clearly label the product as local demo mode.
- [ ] Cover loading, empty, error, success, focus, keyboard, and destructive-action confirmation states.

**Exit criteria:** every local route is usable without a full reload or ambiguous placeholder state.

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
