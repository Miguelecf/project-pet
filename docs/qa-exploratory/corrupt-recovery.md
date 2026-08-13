# Corrupt recovery exploratory QA

This unexecuted session sheet verifies that malformed local data degrades safely to the documented recovery state.

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

Verify graceful recovery from corrupt, unavailable, or incompatible local demo storage without a crash or internal-detail disclosure.

## Setup

1. Start from a fresh local demo tab with fake seed data.
2. Record browser, build, commit, storage key, and initial state.
3. Use developer tools only in a dedicated local test profile; do not use personal or production data.

## Checks

1. Save evidence of the normal seeded dashboard.
2. Replace the local demo storage value with invalid JSON and reload.
3. Confirm no crash and the documented empty or seed recovery prompt.
4. Use the visible recovery path and confirm deterministic seed data returns.
5. Replace storage with parseable but structurally malformed data and reload.
6. Confirm graceful recovery and no raw parser, storage, credential, or stack details.
7. If storage cannot be modified, record the limitation and leave the session unexecuted.

## Expected results

- Invalid or malformed persisted data does not crash the application.
- The application degrades to the documented empty or seed recovery state.
- Restore makes the deterministic fake dataset available again.

## Evidence and findings

| Check | Evidence link or note | Actual result | Finding ID |
| --- | --- | --- | --- |
| Environment and initial state |  | Not executed |  |
| Invalid JSON reload |  | Not executed |  |
| Recovery action |  | Not executed |  |
| Malformed envelope reload |  | Not executed |  |
| Error disclosure |  | Not executed |  |

## Severity tracking

| Finding ID | Severity | Description | Owner | Status | Resolution or acceptance |
| --- | --- | --- | --- | --- | --- |
|  | BLOCKER | Prevents the session or demo from continuing |  | Open |  |
|  | CRITICAL | Crash, unrecoverable state, or unsafe error disclosure |  | Open |  |
|  | MAJOR | Recovery is unclear or cannot restore the demo reliably |  | Open |  |
|  | MINOR | Cosmetic or limited usability issue |  | Open |  |
|  | SUGGESTION | Improvement with no observed defect |  | Open |  |

## Acceptance gate

Pass only when there are zero BLOCKER/CRITICAL findings and every MAJOR finding is resolved or explicitly accepted.
