# Executable Delivery Plan

**M0.2 repository contracts is complete after its corrective contract gate.** The
next executable unit remains **M0.3a: local persistence core and catalog adapters**.

## Quick path

1. Implement the M0.3a local schema and gateway behind completed repository contracts.
2. Run the reusable supplier, category, and settings contracts against local adapters.
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
- [x] Run focused contract tests plus tests, coverage, lint, and build; record the evidence in apply progress.
- [x] Correct the M0.2 contract gate: real category invoice-line references,
  complete settings defaults, persisted payment balance/status, and observable CRUD lists.
- [x] Prove representative broken test-only adapters fail the shared contracts
  before retaining M0.2 completion.

**Exit criteria:** UI-facing code depends only on module repositories/services, and
the adapter contract suite can be executed against each implementation. M0.3 has
not started.

### Next — M0.3a local persistence core and catalog adapters

- [ ] Implement a versioned local schema behind the M0.2 contracts.
- [ ] Defensively recover from empty, malformed, or incompatible persisted JSON.
- [ ] Run supplier, category, and settings contracts against local adapters.
- [ ] Prove empty, malformed, incompatible, and failed-write recovery with automated tests.

**Exit criteria:** catalog data survives refresh and recovery behavior is proven. Seed restore remains M0.3b.

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
