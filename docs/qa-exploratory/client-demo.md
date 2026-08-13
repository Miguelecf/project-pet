# Client demo exploratory QA

This unexecuted session sheet assesses the guided client demo as a coherent, local-only product-owner walkthrough.

## Session record

| Field | Value |
| --- | --- |
| Date | 2026-08-12 (planned; update when executed) |
| Build | Not executed — record local build identifier before testing |
| Commit | Not executed — record checked-out commit before testing |
| Owner | Unassigned |
| Status | Planned |
| Result | Not executed |

## Objective

Verify that `docs/demo-script.md` can be followed in a real browser from seeded data through recovery, with clear local-demo disclosure and expected outcomes.

## Setup

1. Start the local demo in a fresh browser profile or after Restore demo data.
2. Set device date to 12 August 2026 when validating seeded period examples.
3. Record browser/version, build, commit, device date, and evidence location.
4. Use fake demonstration data only; do not enter production or personal data.

## Checks

1. Follow local-only disclosure and seeded-dashboard steps in `docs/demo-script.md`.
2. Confirm two suppliers, six categories, three invoice states, daily-income records, and overdue alert are understandable as fake demo data.
3. Follow catalog, invoice creation, partial payment, complete payment, void payment, and daily-income steps exactly as written.
4. Validate day, week, and month behavior, estimated cash result disclosure, alerts, latest invoices, and category breakdown against documented expected results.
5. Follow Restore demo data confirmation and recovery steps; confirm deterministic seed data returns.
6. Ask client validation questions in the script and log answers as evidence or suggestions.
7. Record any script step that cannot be followed, diverges from the UI, or leaves an unrecoverable state.

## Expected results

- A product owner can complete the lifecycle using the document without implementation knowledge.
- Local-only, no-account, no-cloud, and fake-data constraints are clear.
- Restore returns the demo to deterministic starting state after exploratory changes.

## Evidence and findings

| Check | Evidence link or note | Actual result | Finding ID |
| --- | --- | --- | --- |
| Preconditions and disclosure |  | Not executed |  |
| Seeded dashboard |  | Not executed |  |
| Lifecycle steps |  | Not executed |  |
| Dashboard validation |  | Not executed |  |
| Restore and recovery |  | Not executed |  |
| Client feedback |  | Not executed |  |

## Severity tracking

| Finding ID | Severity | Description | Owner | Status | Resolution or acceptance |
| --- | --- | --- | --- | --- | --- |
|  | BLOCKER | Prevents the session or demo from continuing |  | Open |  |
|  | CRITICAL | Core demo flow fails, crashes, or cannot recover |  | Open |  |
|  | MAJOR | Walkthrough materially diverges from the UI or confuses the client |  | Open |  |
|  | MINOR | Cosmetic or limited usability issue |  | Open |  |
|  | SUGGESTION | Improvement with no observed defect |  | Open |  |

## Acceptance gate

Pass only when there are zero BLOCKER/CRITICAL findings and every MAJOR finding is resolved or explicitly accepted.
