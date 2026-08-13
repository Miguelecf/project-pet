# Keyboard navigation exploratory QA

This unexecuted session sheet validates keyboard-only operation of the local demo's available interactive paths.

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

Verify that required controls can be navigated and operated using only Tab, Shift+Tab, Enter, Space, and Escape.

## Setup

1. Start the local demo in a desktop browser at 100% zoom.
2. Avoid the mouse after loading the application.
3. Record browser/version, build, commit, and starting route.
4. Use fake demo data only and restore it if any mutation is created.

## Checks

1. Press Tab from the page start; confirm the skip link becomes visible and Enter moves focus to main content.
2. Tab through sidebar or mobile menu; use Enter to visit primary routes and confirm route focus lands on the page heading.
3. On Dashboard, use Tab and Enter to change periods and activate visible invoice or alert links.
4. Open a create or edit form, tab through fields and actions, submit valid and invalid input, and confirm feedback is reachable.
5. Open a destructive confirmation dialog using Enter or Space; verify focus stays inside with Tab and Shift+Tab, Escape cancels, and focus returns to its trigger.
6. Repeat the dialog check for Restore demo data; confirm with keyboard only, observe result feedback, then restore the seed if needed.
7. Record any keyboard trap, lost focus, invisible focus indicator, unreachable control, or pointer-only action.

## Expected results

- Required interactive elements are reachable in a visible, logical focus order.
- Enter and Space activate applicable controls; Escape cancels dialogs.
- Dialog focus is contained and returns safely after close; route changes focus the page heading.

## Evidence and findings

| Check | Evidence link or note | Actual result | Finding ID |
| --- | --- | --- | --- |
| Skip link and route focus |  | Not executed |  |
| Navigation and dashboard |  | Not executed |  |
| Form validation |  | Not executed |  |
| Destructive dialog |  | Not executed |  |
| Restore dialog and feedback |  | Not executed |  |

## Severity tracking

| Finding ID | Severity | Description | Owner | Status | Resolution or acceptance |
| --- | --- | --- | --- | --- | --- |
|  | BLOCKER | Prevents the session or demo from continuing |  | Open |  |
|  | CRITICAL | Keyboard-only user cannot complete a required workflow |  | Open |  |
|  | MAJOR | A required control is unreachable or unreliable by keyboard |  | Open |  |
|  | MINOR | Cosmetic or limited usability issue |  | Open |  |
|  | SUGGESTION | Improvement with no observed defect |  | Open |  |

## Acceptance gate

Pass only when there are zero BLOCKER/CRITICAL findings and every MAJOR finding is resolved or explicitly accepted.
