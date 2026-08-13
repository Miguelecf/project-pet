# Responsive layout exploratory QA

This unexecuted session sheet assesses the local demo at narrow and wide viewport extremes.

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

Verify that shell, navigation, forms, dialogs, lists, and dashboard remain readable and operable at 320px and 1920px viewport widths.

## Setup

1. Start the local demo with deterministic fake data.
2. Record browser/version, 100% zoom, build, and commit.
3. Use exact CSS viewport widths of 320px and 1920px and record separate evidence for each.

## Checks

1. At 320px, open and close navigation; confirm links remain readable and unobscured.
2. At 320px, visit every primary route and inspect headings, controls, lists, and alerts for clipping, overlap, or layout-caused horizontal overflow.
3. At 320px, open an invoice form and confirmation dialog; confirm labels, errors, and actions remain visible and usable.
4. At 1920px, visit the same routes and confirm content is grouped, readable, and aligned without overlap or unreachable controls.
5. At 1920px, change Dashboard periods and confirm metrics, latest invoices, categories, and alerts remain legible.
6. Distinguish intentional data scrolling from layout overflow that hides required controls.

## Expected results

- At both widths, no required content or control is clipped, overlapped, or unreachable.
- Mobile navigation opens and closes; wide layout remains readable and stable.
- Dialogs, validation messages, and dashboard content remain usable at both widths.

## Evidence and findings

| Check | Evidence link or note | Actual result | Finding ID |
| --- | --- | --- | --- |
| 320px shell and navigation |  | Not executed |  |
| 320px routes and forms |  | Not executed |  |
| 320px dialog |  | Not executed |  |
| 1920px routes |  | Not executed |  |
| 1920px dashboard |  | Not executed |  |

## Severity tracking

| Finding ID | Severity | Description | Owner | Status | Resolution or acceptance |
| --- | --- | --- | --- | --- | --- |
|  | BLOCKER | Prevents the session or demo from continuing |  | Open |  |
|  | CRITICAL | Required information or controls are unusable |  | Open |  |
|  | MAJOR | A required route or workflow is materially degraded |  | Open |  |
|  | MINOR | Cosmetic or limited usability issue |  | Open |  |
|  | SUGGESTION | Improvement with no observed defect |  | Open |  |

## Acceptance gate

Pass only when there are zero BLOCKER/CRITICAL findings and every MAJOR finding is resolved or explicitly accepted.
