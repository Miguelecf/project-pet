# Proposal: Admin-Managed Email Auth (A1.1 + A1.2)

## Intent

Admin-only user provisioning via Supabase Dashboard with email/password login. No public signup. No backend code — auth is fully Supabase-managed. Resolves the "no authentication" blocker for all protected features.

## Scope

### In Scope
- **A1.1** (Dashboard): site URL (`http://localhost:5173/`), redirect URLs (root + `/update-password`), disable signups, JWT expiry=900s, test user
- **A1.2** (Code): `/login`, `/forgot-password`, `/set-password`, `/update-password`; AuthGuard; sign-out; invite-callback capture → sessionStorage → internal navigate to `/set-password`
- Session persistence & auto-refresh (configured); Dashboard ban/unban with documented 900s residual window
- Strict TDD: hooks, guards, form validation, mocked supabase client; DOM harness for guard/route testing
- **Sign-out without A1.3**: minimal temporary sign-out button on protected landing route (e.g., `/dashboard`). Delegates to `supabase.auth.signOut()`, redirects to `/login`. Explicitly NOT a sidebar/header/nav shell — will be replaced when A1.3 ships.

### Out of Scope
A1.3 nav shell (sidebar, header, layout), custom admin UI, billing, SMS/OAuth, custom SMTP code, tenant RLS (A2.1)

## Capabilities

### New Capabilities
- `email-auth`: Email/password auth with admin-provisioned users — login, password lifecycle, session guard, sign-out, invite capture.

### Modified Capabilities
None (first capability).

## Security Contracts (mandatory for downstream specs)

1. **No self-signup**: codebase MUST NOT contain `/signup` route, signup link, or `supabase.auth.signUp()` call.
2. **Password isolation**: application code MUST NOT persist, log, serialize, cache beyond transient form state, custom-hash, or send passwords to app-controlled/non-Supabase endpoints. Browser form state MAY hold plaintext transiently and submit directly through official `supabase.auth` SDK over HTTPS/TLS. Clear form state after completion/abandonment.
3. **Forgot-password response**: generic response regardless of account existence — no account enumeration.
4. **`/set-password`**: requires valid invite-established session (user confirmed identity, no password yet). Fails safely on invalid/missing session.
5. **`/update-password`**: requires valid recovery-established session (type=recovery). Fails safely on invalid/missing session.
6. **Invite capture (app-owned)**: Dashboard "Send invitation" accepts email only — cannot set per-invite `redirectTo`. Dashboard-issued invite lands at Site URL root carrying the Supabase invite callback marker in the URL. Application MUST capture only the non-secret URL callback marker BEFORE `createClient`. Create the Supabase client. Register a minimal synchronous `onAuthStateChange` observer immediately at the client initialization boundary (before React mounts), and atomically buffer the first callback outcome. Bind the marker to the expected event/session, persist bounded non-secret provenance in `sessionStorage`, then internally replace-navigate to `/set-password`. Never rely on a later generic `SIGNED_IN` or `user_metadata`. `/set-password` is an **app route**, not a Dashboard invitation redirect target.
7. **Recovery redirect**: `resetPasswordForEmail({ email, options: { redirectTo: origin + '/update-password' } })`. `/update-password` MUST be allowlisted in Dashboard redirect URLs.
8. **Invite/recovery provenance storage**: provenance state MUST be stored only in `sessionStorage` — bounded, non-secret, session-scoped. MUST NOT contain tokens, passwords, or `user_metadata`. MUST be cleared on: invite completion, sign-out, session mismatch, abandonment, or link expiry. Exists only for reload safety across the invite→set-password and recovery→update-password windows.
9. **Invalid/expired links**: both routes handle expired/missing sessions gracefully — redirect to `/login` with message, no crash.
10. **A1.1 redirect allowlist**: Dashboard must allowlist Site URL root and `/update-password`. Do NOT claim allowlisting `/set-password` selects the invite destination — invite landing is always Site URL root. If `/set-password` is allowlisted defensively, it is NOT what selects invitation landing.

## Approach

Dashboard-only admin + client-side auth. All flows use `supabase.auth` SDK. No `password` column, no custom hashing.

| Flow | SDK | Route |
|------|-----|-------|
| Login | `signInWithPassword` | `/login` |
| Invite→capture→set password | `onAuthStateChange` + `updateUser` | root → `/set-password` |
| Recovery | `resetPasswordForEmail` + `updateUser` | `/update-password` |
| Forgot | `resetPasswordForEmail` | `/forgot-password` |
| Guard | `getSession()` | AuthGuard |
| Sign-out | `signOut()` | Protected landing route (temp, → A1.3) |
| Ban/unban | Dashboard | — |

## Affected Areas

| Area | Impact |
|------|--------|
| `src/modules/auth/` | New — hooks, pages, guards, invite-capture logic |
| `src/App.tsx` | Modified — Router, route tree |
| `src/lib/supabase/index.ts` | Modified — re-export AuthError, AuthResponse types |
| `openspec/config.yaml` | Modified — React 18→19 (doc fix) |

## Dependencies

- Supabase project reachable (confirmed), email provider enabled (confirmed)
- **Existing**: `react-router-dom@7.18.2`, `vitest@4.1.10`, `@vitest/coverage-v8@4.1.10` — already in `package.json`
- **New dev (DOM harness)**: `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`, `jsdom@26.1.0` — minimal pinned harness for guard/route render tests. Compatible with Node v22.16.0. Commit lockfile during apply.
- Existing Vitest mocks for supabase client; DOM harness enables controlled render tests for AuthGuard and invite-capture flows.

## SMTP Staging Contract

- **Local/team E2E**: uses pre-authorized organization team address; respects 2 emails/hour built-in limit.
- **Hourly send budget**: one invite email + one recovery/forgot-password email = 2 of 2 sends consumed. No retry possible within the same hour. Space operations accordingly.
- **Pre-release gate**: custom SMTP MUST be configured and verified before inviting external users. Dashboard-only change (no code).

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Built-in SMTP: 2/hr, team-only | High | Space invites across hours; custom SMTP as pre-release gate |
| Banned users retain JWTs ≤900s | Medium | 900s JWT expiry; documented limitation |
| No tenant isolation | Medium | RLS planned A2.1; auth standalone viable |
| Review budget: ~630 vs 400 lines | **High** | Decision required before apply; chained PRs: #1 (~310) hook+guard+router, #2 (~320) pages |

Decision needed before apply: Yes
400-line budget risk: High

## Rollback Plan

1. Revert app revision (no DB migrations). Keep public signup **disabled** — admin-only invariant persists unconditionally.
2. Remove redirect URLs from Dashboard only after confirming no active invite/recovery links depend on them.
3. Ban or delete test-only user if no longer needed.
4. No Supabase Auth config rollback for signup state — users remain in Auth, signup stays disabled.

## Success Criteria

- [ ] A1.1: disabled signups, 900s JWT, test user receives invite email
- [ ] A1.2: all four flows work end-to-end on localhost; invite capture → `/set-password` works
- [ ] AuthGuard blocks unauthenticated access; sign-out clears session, redirects `/login`
- [ ] Ban blocks new sign-ins + refresh; residual JWT window ≤15 min
- [ ] `sessionStorage` provenance cleared on completion, sign-out, mismatch, abandonment, expiry
- [ ] All tests pass (`npm run test:run`); `npm run build` succeeds
- [ ] No passwords persisted, logged, serialized, cached, custom-hashed, or sent to non-Supabase endpoints in application code
