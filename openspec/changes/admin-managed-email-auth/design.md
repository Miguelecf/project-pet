# Design: Admin-Managed Email Auth

## Technical Approach

A1.1 is a Dashboard checklist; A1.2 is browser-only. Site URL stays root; Dashboard invites cannot choose `redirectTo`, so root captures the marker and replace-navigates internally. No backend, `service_role`, custom admin, A1.3, RLS, SMS, OAuth, or custom SMTP code.

## Architecture Decisions

| Decision | Choice / rationale | Rejected |
|---|---|---|
| Initialization boundary | `client.ts` captures only marker kind/error presence, calls `createClient`, then immediately registers one synchronous, dispatch-only observer before `main.tsx` mounts. It atomically stores the first callback outcome and publishes later events; SDK work runs in queued provider effects. | React-owned subscription can miss the decisive event; async callbacks can deadlock/delay auth events. |
| Provenance | `sessionStorage` record: `{version, flowKind, expectedRoute, userId, issuedAt, expiresAt}`; expiry is at most 900 seconds and no later than session expiry. It contains no token, password, or `user_metadata`. Validate route, time, and current `session.user.id`; clear on completion, sign-out, mismatch, explicit cancel/non-flow navigation, or expiry. This is reload-safe UX provenance, NEVER authorization. | Memory-only loses reloads; durable storage broadens exposure. |
| Event binding | Invite requires captured `invite` marker + first callback `SIGNED_IN`; recovery requires captured `recovery` marker + first `PASSWORD_RECOVERY`. Record whether that callback established the current session. `INITIAL_SESSION` or later generic `SIGNED_IN` never creates provenance. | Session/password state cannot prove flow origin. |
| Invalid callbacks | Scrub marker/error fields once, mark bootstrap consumed, clear mismatched provenance, and replace-route: unrelated authenticated session → `/dashboard` with generic notice; anonymous or callback-established invalid session → sign out only the latter, then `/login` with notice. Direct authenticated `/login` replace-redirects `/dashboard`, preserving notices. | Unconditional sign-out destroys unrelated sessions; callback redirects can loop. |
| Dependencies | Pin `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`, `jsdom@26.1.0`; commit `package-lock.json`. Verified runtime is Node v22.16.0; do not use jsdom 30. | Unpinned/latest dependencies make the TDD harness non-reproducible. |

## Required Sequences

```text
Dashboard invite → root(marker) → capture → createClient → observer → SIGNED_IN buffered
→ provider consume/subscribe → store invite provenance → scrub → replace /set-password
→ updateUser → clear → /dashboard
```

```text
/forgot-password → resetPasswordForEmail({email, options:{redirectTo: origin + '/update-password'}}) → callback(recovery)
→ capture → createClient → observer → PASSWORD_RECOVERY buffered → provider → store
→ scrub → /update-password → updateUser → clear → /dashboard
```

```text
reload flow route → capture(no marker) → createClient → observer → provider consumes buffer
→ read sessionStorage → getSession outside callback → validate user/route/expiry
→ continue; mismatch/expiry → clear → replace /login
```

```text
authenticated + stale callback → capture → createClient → observer → invalid outcome buffered
→ provider detects callback did not establish current session → keep session → scrub once
→ clear stale provenance → replace /dashboard + notice (no loop)
```

## Contracts and Requirement Coverage

`AuthBootstrapOutcome` is single-consumer; provider subscribes to its event bus before bootstrap reconciliation. `AuthGuard` has loading/authenticated/anonymous states and preserves `from`. Password actions return sanitized results and clear controlled fields.

| Requirements | Design answer |
|---|---|
| R1–R6 | No signup API/route; Dashboard invite; generic login; persistent auto-refresh session; three-state guard; temporary protected sign-out. |
| R7–R11 | Generic reset response; event-bound invite/recovery guards; transient passwords; visible client validation. |
| R12–R15 | Root + `/update-password` allowlist, signups off, JWT 900s; ban residual window; 2/hr team SMTP and external custom-SMTP gate; no RLS. |
| R16–R18 | Strict TDD/manual email E2E; exact pre-mount capture/buffer order; unrelated-session-safe invalid callback handling. |

## File Changes and Testing

Create `src/lib/supabase/{auth-bootstrap,auth-provenance}.ts`; modify `client.ts`, `index.ts`, `main.tsx`, `App.tsx`. Create `src/modules/auth/` provider, reducer, guards, validation, pages, notices, and colocated tests. Modify `vitest.config.ts`, `package.json`, `package-lock.json`, `openspec/config.yaml`. Unit-test marker scrubbing, atomic buffer, provenance bounds/clearing, reducers, validation; jsdom integration-test ordering, reload, guards, notices, no loops, SDK arguments, field clearing, and Strict Mode. `detectSessionInUrl`, delivery, Dashboard, ban, SMTP/JWT semantics remain manual E2E. Every slice uses RED→GREEN→REFACTOR, `npm run test:run`, coverage, and `npm run build`.

## Review Slices

1. Pinned harness + pure marker/provenance modules/tests; real diff <400; rollback removes isolated utilities.
2. Client observer/buffer + provider/guards/tests; real diff <400; rollback restores current client boundary.
3. Router, login, forgot, dashboard/sign-out/tests; real diff <400; rollback restores scaffold App.
4. Invite/recovery pages, reload/invalid-flow tests, Dashboard runbook; real diff <400; rollback removes password-flow routes.

Each cumulative slice independently tests/builds and is a chained-PR rollback boundary.

Decision needed before apply: Yes
Chained PRs recommended: Yes
400-line budget risk: High

## Migration / Rollout

No database migration. Configure root Site URL, root plus `/update-password` redirects, disabled signup, JWT 900s, team test invite; custom SMTP is mandatory before external users. Keep signup disabled on rollback and retain redirects until links expire.

## Open Questions

None blocking.
