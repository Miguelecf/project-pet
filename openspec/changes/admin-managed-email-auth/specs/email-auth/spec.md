# email-auth Specification

## Purpose

Admin-provisioned email/password auth. No public signup. Supabase Dashboard + client SDK. Scope: A1.1 + A1.2.

## Requirements

### R1: No Public Signup

Codebase MUST NOT contain `/signup` route, signup link, or `signUp()` call. User creation MUST be Dashboard-only.

#### Scenario: No signup route

- GIVEN deployed app — WHEN `/signup` navigated — THEN 404 or redirect `/login`

#### Scenario: No signup call

- GIVEN full source — WHEN analyzed — THEN zero `signUp()` invocations

### R2: Admin Dashboard Invite and App-Side Capture

Dashboard invite lands at configured Site URL root carrying a non-secret invite callback marker. Application MUST: (1) capture the marker from the URL BEFORE `createClient`; (2) create the Supabase client; (3) register a minimal synchronous `onAuthStateChange` observer immediately at the client initialization boundary (before React mounts); (4) atomically buffer the first callback outcome; (5) bind the marker to the expected event/session; (6) persist bounded non-secret provenance in `sessionStorage`; (7) internally replace-navigate to `/set-password`. `/set-password` is an app route, NOT a Dashboard invitation redirect target.

#### Scenario: Admin invite

- GIVEN admin in Dashboard — WHEN user invited — THEN email targets Site URL root (not `/set-password`)

#### Scenario: Invite capture sequence

- GIVEN invite link opened at Site URL root with callback marker — WHEN app initializes — THEN marker captured before createClient, observer registered at init boundary before React, first callback buffered, provenance persisted, internal replace-navigation to `/set-password`

### R3: Login

`/login` authenticates via `signInWithPassword`. Errors MUST be generic.

#### Scenario: Success

- GIVEN valid credentials — WHEN submitted — THEN session established, redirect to landing

#### Scenario: Failure

- GIVEN wrong credentials — WHEN submitted — THEN generic error, no field indicated

#### Scenario: Loading

- GIVEN request in-flight — WHEN rendering — THEN form disabled, indicator shown

### R4: Persistent Session

Sessions persist across navigations/restarts within JWT window. Auto-refresh active. A ban does NOT immediately invalidate an existing access JWT/session; state invalidation occurs when the token expires or the next refresh/sign-in attempt fails.

#### Scenario: Survives refresh

- GIVEN active session — WHEN browser refreshed — THEN remains authenticated

#### Scenario: Ban does not immediately revoke

- GIVEN active session with valid JWT — WHEN user banned — THEN current JWT remains valid until expiry; next refresh or sign-in fails

#### Scenario: State invalidation on expiry

- GIVEN expired or refresh-failed session — WHEN checked — THEN unauthenticated

### R5: AuthGuard

Renders loading/authenticated/unauthenticated. Unauthenticated redirects to `/login` with intended route.

#### Scenario: Loading

- GIVEN session unresolved — WHEN renders — THEN loading indicator, no flash

#### Scenario: Authenticated

- GIVEN valid session — WHEN guarded route accessed — THEN content rendered

#### Scenario: Unauthenticated + intended route

- GIVEN no session at `/dashboard` — WHEN detected — THEN redirect `/login`, route preserved

### R6: Temporary Sign-Out

Minimal sign-out on protected landing. Calls `signOut()`, redirects `/login`. NOT a nav shell — replaced by A1.3.

#### Scenario: Sign-out

- GIVEN authenticated on landing — WHEN sign-out activated — THEN session cleared, redirect `/login`

### R7: Forgot-Password Generic Response

`/forgot-password` returns identical response regardless of email existence. Prevents enumeration.

#### Scenario: Existing account

- GIVEN registered email — WHEN submitted — THEN generic message, recovery email sent

#### Scenario: Non-existing account

- GIVEN unregistered email — WHEN submitted — THEN identical generic message, no email

### R8: Invite-Established Set-Password

`/set-password` requires valid invite-established session PLUS valid bounded invite provenance in `sessionStorage`. Provenance MUST NOT contain tokens, passwords, or `user_metadata`. MUST be reload-safe. MUST be cleared on: completion, sign-out, session mismatch, abandonment, or link expiry. Later generic `SIGNED_IN` or `INITIAL_SESSION` events MUST NOT manufacture provenance.

#### Scenario: Valid invite + provenance

- GIVEN valid invite session AND valid bounded provenance — WHEN password submitted — THEN set via `updateUser`, provenance cleared, redirect to landing

#### Scenario: Valid session, missing provenance

- GIVEN valid session but no bounded invite provenance — WHEN `/set-password` accessed — THEN redirect `/login` with message

#### Scenario: Provenance mismatch

- GIVEN provenance exists but session does not match — WHEN checked — THEN provenance cleared, redirect `/login`

#### Scenario: Expired/invalid

- GIVEN expired/invalid invite link — WHEN accessed — THEN redirect `/login` with message

#### Scenario: Reload safety

- GIVEN valid invite session and provenance — WHEN page reloaded — THEN provenance survives reload, flow continues

### R9: Recovery-Established Update-Password

`/update-password` requires valid recovery-established session (type=recovery) PLUS valid bounded recovery provenance in `sessionStorage`. Provenance MUST NOT contain tokens, passwords, or `user_metadata`. MUST be reload-safe. MUST be cleared on: completion, sign-out, session mismatch, abandonment, or link expiry.

#### Scenario: Valid recovery + provenance

- GIVEN valid recovery session AND valid bounded provenance — WHEN password submitted — THEN updated via `updateUser`, provenance cleared, redirect to landing

#### Scenario: Valid session, missing provenance

- GIVEN valid recovery session but no bounded provenance — WHEN `/update-password` accessed — THEN redirect `/login` with message

#### Scenario: Expired/invalid

- GIVEN expired/invalid recovery link — WHEN accessed — THEN redirect `/login` with message

#### Scenario: Reload safety

- GIVEN valid recovery session and provenance — WHEN page reloaded — THEN provenance survives reload, flow continues

### R10: Transient Password Handling

MUST NOT persist, log, serialize, cache, custom-hash, or send passwords to non-Supabase endpoints. Transient form state only, official SDK over TLS. Clear after completion/abandonment.

#### Scenario: No persistence

- GIVEN any password form — WHEN submitted/abandoned — THEN no password in state, logs, storage, or non-Supabase requests

#### Scenario: Cleared post-completion

- GIVEN successful operation — WHEN finished — THEN password fields cleared

### R11: Password Validation

Rules explicitly defined, visible before submission, enforced client-side before SDK call.

#### Scenario: Rules visible

- GIVEN password form — WHEN rendered — THEN requirements shown

#### Scenario: Validation failure

- GIVEN non-compliant password — WHEN submit attempted — THEN blocked, unmet rule indicated

### R12: Dashboard A1.1 Evidence

Site URL set to root, redirect URLs allowlist includes Site URL root and `/update-password`, signup disabled, JWT expiry 900s, test user invited to team address. `/set-password` is NOT a Dashboard redirect URL and MUST NOT be claimed as what selects invitation landing.

#### Scenario: Audit

- GIVEN A1.1 complete — WHEN audited — THEN Site URL root confirmed, `/update-password` allowlisted, signup disabled, JWT 900s, team-address invite delivered

### R13: Ban/Unban

Banned users blocked from sign-in and refresh. Active JWTs valid until expiry (≤900s). Unban restores access.

#### Scenario: Banned login

- GIVEN active ban — WHEN sign-in attempted — THEN rejected

#### Scenario: Residual JWT

- GIVEN banned user with pre-ban JWT — WHEN request made — THEN succeeds until expiry (≤900s)

#### Scenario: Unban

- GIVEN ban removed — WHEN sign-in attempted — THEN succeeds

### R14: SMTP Staging

Local/team uses pre-authorized address within 2/hr limit. Custom SMTP MUST be configured and verified before external invites (pre-release gate, no code change). Without custom SMTP, operational policy MUST prevent attempting external invites. Supabase built-in SMTP behavior for external addresses is not guaranteed to block in-app; the constraint is enforced by team process, not platform.

#### Scenario: Team invite

- GIVEN built-in SMTP — WHEN team-address invited — THEN delivered (1 of 2 hourly)

#### Scenario: External gate

- GIVEN no custom SMTP — WHEN external invite considered — THEN operational policy prevents attempt; custom SMTP required first

### R15: No Tenant Isolation Before A2.1

MUST NOT claim or implement tenant RLS before A2.1. Auth standalone.

#### Scenario: No RLS

- GIVEN current scope — WHEN DB inspected — THEN no tenant-isolation policies

### R16: Strict TDD and E2E Boundaries

Testable units follow strict TDD. Server interaction, `detectSessionInUrl`, email delivery are manual E2E only.

#### Scenario: TDD units

- GIVEN hooks, guards, validation — WHEN implemented — THEN tests first (red → green → refactor)

#### Scenario: E2E boundary

- GIVEN server interaction, detectSessionInUrl, email — WHEN planned — THEN manual E2E, not unit

### R17: Invite Callback Capture Order

The invite capture sequence MUST follow this strict order: (1) marker captured from URL before `createClient`; (2) Supabase client created; (3) synchronous `onAuthStateChange` observer registered at initialization boundary before React mounts; (4) first callback outcome atomically buffered; (5) marker bound to callback event/session; (6) provenance persisted; (7) internal replace-navigation to `/set-password`. `INITIAL_SESSION` and later generic `SIGNED_IN` events MUST NOT manufacture or reconstruct invite provenance.

#### Scenario: Marker before client

- GIVEN invite URL with callback marker — WHEN app loads — THEN marker captured before createClient call

#### Scenario: Observer before React

- GIVEN client created — WHEN observer registered — THEN synchronous onAuthStateChange at init boundary, before any React mount

#### Scenario: First callback buffered

- GIVEN observer active — WHEN first auth state change fires — THEN outcome atomically buffered, not lost to async

#### Scenario: INITIAL_SESSION cannot manufacture provenance

- GIVEN no invite marker captured at init — WHEN INITIAL_SESSION fires — THEN no provenance created, `/set-password` access denied

#### Scenario: Later SIGNED_IN cannot manufacture provenance

- GIVEN no invite marker at init — WHEN later SIGNED_IN fires — THEN no provenance created or reconstructed

### R18: Already-Authenticated Callback Safety

When an already-authenticated user opens an invalid or stale invite/recovery callback URL, the system MUST NOT sign out the unrelated existing session. The system MUST scrub callback parameters from the URL and route deterministically without redirect loops.

#### Scenario: Authenticated user opens stale invite

- GIVEN active unrelated session — WHEN stale invite URL opened — THEN existing session preserved, callback params scrubbed, routed deterministically (no loop)

#### Scenario: Authenticated user opens stale recovery

- GIVEN active unrelated session — WHEN stale recovery URL opened — THEN existing session preserved, callback params scrubbed, routed deterministically (no loop)
