# Exploration: Admin-Managed Email Auth (A1.1 + A1.2)

## Current State

The project is a React 19 + TypeScript + Vite SPA with a modular feature-based structure. The Supabase client is isolated in `src/lib/supabase/` with runtime guards validated by 13/13 passing Vitest tests. No auth UI, hooks, routes, or React Router integration exist yet. The `src/modules/auth/` directory exists but is empty.

**Operational status**: Hosted Supabase project confirmed reachable (HTTP 200 on `/auth/v1/settings`), email/password auth provider enabled, 13/13 client-side tests pass. Public signup is currently enabled and must be disabled. Site URL needs Dashboard confirmation.

**Pending A1.1 tasks**:
- Set Site URL to `http://localhost:5173` in Supabase Dashboard
- Disable public signups (`Allow new users to sign up` = OFF)
- Register a test user

## Affected Areas

| Path | Impact |
|---|---|
| `src/modules/auth/` | New hooks, pages, guards — core of A1.2 |
| `src/lib/supabase/index.ts` | May re-export `AuthError`, `AuthResponse` types for hooks |
| `src/App.tsx` | Must wrap in Router, add route tree with auth-aware routes |
| `src/main.tsx` | No change (App is root) |
| `openspec/config.yaml` | Stack note says React 18; actual is 19 — doc fix, not code |
| Supabase Dashboard | A1.1: Site URL, disable signups, test user |

## Requirements Mapped to Flow

### Requirement: No public self-registration (admin provisions users)

**Approach**: Supabase Dashboard-only administration for MVP. The admin uses the Supabase Dashboard UI to create/invite users. No custom admin UI or backend code.

**Evidence**:
- `supabase.auth.admin.inviteUserByEmail()` and `admin.createUser()` require `service_role` key — cannot run in browser
- For MVP with one admin, Dashboard-based user management is zero-code, secure (service_role never leaves Supabase servers), and immediate
- Custom admin UI (Netlify Function or Supabase Edge Function) would add deployment complexity and code surface for no MVP benefit

### Requirement: Password invite flow (email only, admin-triggered)

The invite flow has two sub-flows: **initial password setup** (after invite) and **password recovery** (user-triggered). These are distinct and MUST be handled by dedicated routes.

**Invite → Set Password flow** (admin-triggered via Dashboard):

1. Admin creates user in Dashboard → Supabase sends invite email
2. User clicks invite link → Supabase Auth exchanges token, redirects to `http://localhost:5173/set-password` with session in URL hash
3. `detectSessionInUrl: true` (already configured in `client.ts`) picks up the session
4. User is authenticated but has NO password yet — this is the critical distinction from recovery
5. User MUST call `supabase.auth.updateUser({ password })` on `/set-password` page before using the app
6. After successful password set → redirect to dashboard

**Why `/set-password` is distinct from `/update-password`**:
- `/set-password`: user has never set a password (post-invite state). The user has a confirmed/verified identity but no credential. The page is reachable only after an invite acceptance and must gate on *password absence*, not on recovery token type.
- `/update-password`: user already has a password and is resetting it via a recovery token (`type=recovery` in URL hash). This is the forgot-password flow.
- `/forgot-password`: the trigger page (pre-recovery) where user enters email to request a reset link.
- A unified route (`/auth/password`) that inspects the user's password state could work, but two dedicated routes (`/set-password` and `/update-password`) are safer for MVP: they have distinct invariants, distinct error states, and distinct redirect logic. No ambiguity for the reviewer.

**Password recovery flow** (user-triggered):

1. User clicks "Forgot password" on login page
2. Client calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'http://localhost:5173/update-password' })`
3. Supabase sends recovery email → user clicks link → Supabase redirects to `/update-password#...type=recovery`
4. `detectSessionInUrl` exchanges the recovery token for a session
5. User enters new password → `supabase.auth.updateUser({ password })` called from `/update-password` page
6. Redirect to dashboard

**Required authorized redirect URLs** (Dashboard → Authentication → URL Configuration):
- `http://localhost:5173/set-password` — invite acceptance landing
- `http://localhost:5173/update-password` — password recovery landing

### Requirement: Admin can enable/disable users

**Approach**: Use Supabase Auth's `banned_until` mechanism via Dashboard.

**Correct ban semantics** (verified against Supabase Auth docs, `managing-user-data.mdx` and `signout.mdx`):

- Dashboard → Authentication → Users → select user → "Ban user" or set ban duration
- While banned: the user receives `User Banned` on new sign-in attempts AND on refresh-token attempts
- Already-issued access JWTs remain usable until their natural expiry (default 3600s). A ban does NOT retroactively invalidate stateless JWTs.
- Refresh tokens do NOT expire on their own (unlike access tokens), but refresh requests fail while the user is banned — effectively blocking new access-token issuance.
- The JS Admin SDK has no `revoke-by-user-ID` API. `admin.signOut(userJwt, scope?)` requires the user's own JWT and does not invalidate already-issued access JWTs.
- `admin.deleteUser()` is the nuclear option (removes the user row, cascades to `auth.sessions`, invalidates all refresh tokens), but even that cannot retroactively invalidate an already-issued access JWT before its `exp`.

**Mitigation for MVP**: Set short JWT expiry (e.g., 900s = 15 min) in Dashboard → Authentication → Settings → JWT expiry. This bounds the residual access-token window after a ban to at most 15 minutes. Without this, banned users could keep making API calls for up to 3600s (default). Acceptable for MVP; a stricter solution (server-side token validation against `banned_until` via RLS or Edge Function) is out of scope for Slice 1.

### Requirement: Passwords exclusively in Supabase Auth

**Enforced by architecture**: Client-side auth uses `supabase.auth` SDK methods only (`signInWithPassword`, `updateUser`, `resetPasswordForEmail`). No `password` column exists in any application table. No custom password hashing or storage. This is a code-review invariant, not a runtime guard.

## Approach: Dashboard-Only Admin + Client-Side Auth

The admin provisions users through the Supabase Dashboard. The app provides login, invite-password-setup, password recovery, and protected routes. No backend code is written for user management.

| Aspect | Decision |
|---|---|
| User creation | Supabase Dashboard (A1.1) |
| Public signup | Disabled in Dashboard (A1.1) |
| Login page | Client-side `signInWithPassword` (A1.2) |
| Invite → set password | Client-side `/set-password` route + `updateUser({ password })` (A1.2) |
| Password reset | Client-side `resetPasswordForEmail` + `/update-password` route (A1.2) |
| Session persistence | `persistSession: true` + `autoRefreshToken: true` (already configured) |
| Auth guard | Route wrapper checking `supabase.auth.getSession()` |
| Disable user | Dashboard ban (banned_until) |
| Re-enable user | Dashboard unban |
| Session revocation | JWT expiry window (900s); no API for immediate revocation without user's JWT |
| Admin UI | None in MVP — Dashboard only |

### Why not a custom admin UI?

| Factor | Dashboard-Only | Custom Admin UI |
|---|---|---|
| Code to write | 0 lines for admin operations | Netlify Function + admin pages (~300+ lines) |
| Security surface | Service role never in our code | Service role stored as env var (even server-side) |
| Deploy complexity | None | Additional Netlify config + env |
| Maintenance | None | Function runtime, error handling, logging |
| Risk | Very low | Medium (service role exposure risk) |
| Upgrade path | Dashboard is full-featured | Must build every admin feature |

**Recommendation**: Dashboard-only for MVP. Revisit if the user needs in-app admin features later.

## Risks

### Free Tier Constraints

| Constraint | Impact | Mitigation |
|---|---|---|
| Edge Functions: 500,000 invocations/month, up to 100 functions, 150s wall-clock limit | Sufficient for MVP if we later add Edge Functions; not consumed by this change. | N/A — this change uses no Edge Functions. |
| Built-in SMTP: 2 emails/hour project-wide, only sends to pre-authorized organization team addresses | Cannot invite external users via built-in SMTP. Only team-member addresses work. Inviting 3+ team users in short succession fails. | For local development: space invites. For real external users: custom SMTP is required (see operational staging below). |
| Custom SMTP: requires external SMTP credentials/provider (e.g., Resend, SendGrid, AWS SES) but does NOT require a paid Supabase plan | Must configure external SMTP before inviting real users. | Acceptable — custom SMTP is a one-time setup (Dashboard or Management API). No code changes needed. |
| 500MB database | Not relevant for auth-only tables. | Sufficient. |
| 50,000 MAUs free | Far exceeds MVP needs. | N/A. |

### Operational Staging: SMTP Graduation

- **Local development / team-address testing**: Default Supabase SMTP suffices. Only team-member addresses receive emails.
- **Pre-release gate**: Custom SMTP MUST be configured before inviting real external users. This is a Dashboard-only configuration change (no code), listed as a pre-release prerequisite in the proposal, not a blocker for A1.2 implementation.

### Session Revocation Gap

- Banned users retain active access tokens until JWT expiry.
- Refresh requests fail while banned (blocks new token issuance).
- Mitigation: Set JWT expiry to 900s in Dashboard — bounds the residual access-token window to 15 minutes max.
- This is a documented known limitation of Supabase Auth's stateless JWT model. Full revocation requires either `admin.deleteUser()` (nuclear) or a custom server-side token check against `banned_until` (out of scope for Slice 1).

### No Tenant Isolation Yet

- RLS policies are not yet created (A2.1)
- All users share the same database namespace
- Auth alone does not provide data-level isolation
- Mitigation: RLS by `user_id` is planned in Slice 2 and does not block Slice 1

## Change Size Estimate

| Component | Est. Lines | Test Lines |
|---|---|---|
| `useAuth` hook | ~60 | ~80 |
| Login page | ~80 | ~60 |
| SetPassword page | ~60 | ~50 |
| UpdatePassword page | ~60 | ~50 |
| AuthGuard component | ~40 | ~60 |
| Router setup (App.tsx) | ~30 | N/A |
| **Total** | **~330** | **~300** |

**Review budget analysis**:

- Total estimated changed lines: **~630** (330 code + 300 tests)
- Review budget: **400 lines** (per SDD workload guard)
- Exceeds budget by **230 lines (57.5%)**

**Workload Classification**: **HIGH** review-budget risk.

| Guard | Value |
|---|---|
| 400-line budget risk | **High** |
| Decision needed before apply | **Yes** |
| Chained PRs recommended | **Yes** |

**Recommendation**: Split into two chained PR slices:
- **PR #1** (est. ~310 lines): `useAuth` hook + AuthGuard + Router setup → tests pass independently. Deliverable: session-aware route protection without UI.
- **PR #2** (est. ~320 lines): Login page + SetPassword page + UpdatePassword page → tests pass independently. Deliverable: full auth UI.

If the 400-line budget is waived (explicit `size:exception` accepted), a single PR is viable. Default recommendation remains chained.

## Strict TDD Boundaries

Per `openspec/config.yaml` (`strict_tdd: true`), every unit of behavior must have a failing test written first. Testable boundaries for A1.2:

### Testable without external deps (pure units)
- Password validation (minimum length, complexity)
- Email format validation
- AuthGuard: renders children when session exists, redirects when null
- Login form: validation errors, button disabled state
- SetPassword form: validates password, calls updateUser, handles success/error

### Testable with mocked supabase client
- `useAuth` hook: loading → session → signIn success/failure → signOut
- `SetPassword` page: calls `updateUser` with new password, redirects on success, shows error on failure
- `UpdatePassword` page: calls `updateUser` with new password, handles errors

### Not testable in unit tests (manual or integration)
- Actual Supabase auth server interaction (signIn, resetPasswordForEmail, updateUser)
- detectSessionInUrl behavior (requires real browser navigation)
- Email delivery (depends on Supabase SMTP)

## User Actions Required (Dashboard-only, cannot automate)

1. **Set Site URL**: Dashboard → Authentication → URL Configuration → Site URL = `http://localhost:5173`
2. **Add redirect URLs**: Add `http://localhost:5173/set-password` and `http://localhost:5173/update-password` to authorized redirect URLs
3. **Disable public signups**: Dashboard → Authentication → Providers → Email → uncheck "Allow new users to sign up"
4. **Set JWT expiry** (recommended risk mitigation): Dashboard → Authentication → Settings → JWT expiry = 900
5. **Create test user**: Dashboard → Authentication → Users → Add User → invite by email
6. **Pre-release only**: Configure custom SMTP (Dashboard → Authentication → Email → Custom SMTP) before inviting real external users

These are one-time setup steps. They cannot be automated programmatically from the local environment without exposing service_role credentials.

## Ready for Proposal

**Yes**. All eight mandatory corrections from the fresh-context gate are applied:

1. ✅ Free Tier Edge Functions limit corrected (500k invocations, not absent)
2. ✅ Custom SMTP: requires external provider, NOT a paid Supabase plan. Default SMTP restrictions (team-only, 2/hr) documented precisely.
3. ✅ Ban semantics corrected: blocks sign-ins AND refresh attempts; already-issued access JWTs remain until expiry. SDK limitations scoped.
4. ✅ JWT 900s mitigation explained as residual access-token window bounding.
5. ✅ Missing set-password onboarding flow added; `/set-password` distinguished from `/update-password` and `/forgot-password` with explicit rationale for dedicated routes.
6. ✅ Workload classified as HIGH risk (630 lines vs 400 budget); chained PR recommendation with explicit guard table.
7. ✅ Operational staging documented: default SMTP for local/team testing; custom SMTP as pre-release gate.
8. ✅ Readiness assessed: exploration is ready for proposal. Remaining items (custom SMTP config, JWT expiry setting, review-budget strategy) are proposal-level decisions/prerequisites.

No unresolved exploration questions remain. The approach is clear, the risk profile is corrected and documented, and the implementation boundaries are testable under Strict TDD.
