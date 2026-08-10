# Executable Delivery Plan

The next executable unit is **M0.2: repository contracts**. It unlocks local persistence without coupling UI components to `localStorage` or Supabase.

## Quick path

1. Create the M0.2 SDD change artifacts before implementation.
2. Define repository interfaces and reusable adapter contract tests using RED-GREEN-REFACTOR.
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

### Now — M0.2 repository contracts

- [ ] Create an OpenSpec change for local repository contracts and persist its SDD artifacts in Engram.
- [ ] Define module-facing repository operations for settings, suppliers, categories, invoices, payments, and daily income.
- [ ] Ensure pages and components do not import `localStorage` or the Supabase client.
- [ ] Create reusable contract tests that a local adapter and a future Supabase adapter can share.
- [ ] Verify domain contracts remain independent of React and infrastructure.
- [ ] Run tests, coverage, lint, and build; record the evidence in the change verification artifact.

**Exit criteria:** UI-facing code depends only on module repositories/services, and the adapter contract suite can be executed against each implementation.

### Next — M0.3 local persistence adapter

- [ ] Implement a versioned local schema and deterministic seed data behind the M0.2 contracts.
- [ ] Defensively recover from empty, malformed, or incompatible persisted JSON.
- [ ] Add an explicit, confirmed demo-data restore action.
- [ ] Prove refresh persistence and recovery with automated tests.

**Exit criteria:** local demo data survives refresh, restores deterministically, and stores no passwords, tokens, or secrets.

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
- [ ] A conventional milestone commit is prepared on `main` when the user asks to commit.
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
