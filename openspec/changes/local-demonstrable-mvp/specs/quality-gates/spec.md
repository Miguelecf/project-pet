# Quality Gates Specification

## Purpose

Define quality thresholds, domain coverage tests, integration tests, exploratory QA charters, and gate automation for the local demonstrable MVP.

## Requirements

### Requirement: Domain Coverage Tests (G2-LOCAL, G3-LOCAL)

The system SHALL achieve >=90% reachable branch coverage in each catalog module (suppliers, categories, settings — G2-LOCAL) and 100% branch coverage on core financial modules (invoices, payments, daily-income — G3-LOCAL). Coverage MUST be measured by V8 coverage via `npm run test:coverage`. G2-LOCAL SHALL retain defensive guards that are unreachable through valid public behavior; tests MUST exercise reachable error, retry, cancellation, navigation, and mutation paths without changing product behavior merely to execute invalid internal states.

#### Scenario: G2-LOCAL gate passes

- GIVEN all catalog module tests are written
- WHEN `npm run test:coverage` runs
- THEN each supplier, category, and settings module shows >=90% reachable branch coverage
- AND unreachable defensive guards remain in production code

#### Scenario: G3-LOCAL gate passes

- GIVEN all core financial module tests are written
- WHEN `npm run test:coverage` runs
- THEN invoices, payments, and daily-income modules show 100% branch coverage

### Requirement: Edge-Case Tests on Financial Rules (Q2)

The system SHALL include dedicated edge-case tests for financial rules: 0.005 rounding, large quantity × small unit cost, zero-quantity lines, negative inputs, and overpayment detection.

#### Scenario: 0.005 rounding test passes

- GIVEN the rounding edge-case test suite
- WHEN tests run
- THEN the 0.005 case produces the correct rounded result

#### Scenario: Large quantity precision test passes

- GIVEN quantity 10000 and unitCostMinor 5
- WHEN the test runs
- THEN the result is exactly 50000 with no floating-point drift

### Requirement: Integration Tests (Q3)

The system SHALL include integration tests covering multi-step flows: create invoice → register payment → void payment → delete invoice. Tests MUST verify state conservation across steps and corrupt-data recovery.

#### Scenario: Full invoice lifecycle integration test

- GIVEN a fresh store with seed data
- WHEN the test creates an invoice, registers payment, voids it, then deletes the invoice
- THEN each step produces the expected state, the final active query has no invoice, and the deleted filter returns the retained invoice with non-null `deletedAt`

#### Scenario: Corrupt data recovery integration test

- GIVEN localStorage is manually corrupted with invalid JSON
- WHEN the adapter reads and the app initializes
- THEN the app degrades to empty state with seed prompt — no crash

#### Scenario: State conservation across mutations

- GIVEN a sequence of create, edit, delete operations
- WHEN the integration test verifies state after each step
- THEN each step's state is consistent with the cumulative mutations

### Requirement: Gate Configuration (Q4)

The system SHALL define quality thresholds in `openspec/config.yaml`. Thresholds MUST include: test pass (`npm run test:run`), build pass (`npm run build`), lint pass (`npm run lint`), and coverage command (`npm run test:coverage`).

#### Scenario: All gates pass at GMVP

- GIVEN all milestones are complete
- WHEN `npm run test:run && npm run build && npm run lint && npm run test:coverage` runs
- THEN all commands exit with code 0

### Requirement: Exploratory QA Charters (Q5)

The system SHALL include `docs/qa-exploratory/` with session sheets for each charter. Charters MUST cover: refresh persistence, corrupt recovery, 320px/1920px layout, keyboard-only navigation. Each session sheet MUST track findings with severity (critical/major/minor).

#### Scenario: Refresh persistence charter

- GIVEN the refresh persistence charter exists
- WHEN the tester follows the session sheet
- THEN they verify data survives page refresh across all modules

#### Scenario: Corrupt recovery charter

- GIVEN the corrupt recovery charter exists
- WHEN the tester manually corrupts localStorage and reloads
- THEN the app recovers gracefully as documented

#### Scenario: Responsive layout charter

- GIVEN the layout charter exists
- WHEN the tester checks 320px and 1920px viewports
- THEN layout adapts correctly at both breakpoints

#### Scenario: Keyboard navigation charter

- GIVEN the keyboard navigation charter exists
- WHEN the tester navigates using only Tab, Enter, Escape
- THEN all interactive elements are reachable and operable

### Requirement: Severity Tracking

Each QA finding MUST be classified as critical (blocks demo), major (degrades experience), or minor (cosmetic). Critical findings MUST be resolved before GMVP closure.

#### Scenario: Critical finding blocks GMVP

- GIVEN a critical finding is logged
- WHEN GMVP review occurs
- THEN the finding MUST be resolved or accepted with justification before closure

#### Scenario: Minor finding documented but not blocking

- GIVEN a minor finding is logged
- WHEN GMVP review occurs
- THEN the finding is documented but does not block closure

### Requirement: GLM 5.2 Final Review

At GMVP, a GLM 5.2 code review MUST cover all source files in `src/`, `docs/`, and `openspec/`. The review MUST verify gate passage, demo walkthrough execution, and QA charter closure. No code changes SHALL occur during GMVP.

#### Scenario: GLM 5.2 review with all gates green

- GIVEN all gates pass and QA charters are complete
- WHEN GLM 5.2 review is performed
- THEN the reviewer verifies all files with no unresolved findings

#### Scenario: GLM 5.2 review finds unresolved issue

- GIVEN a code issue is found during GLM 5.2 review
- WHEN the issue is identified
- THEN it is documented and MUST be resolved before GMVP closure

### Requirement: 800-Line Milestone Guard

Each milestone commit MUST NOT exceed 800 changed lines (additions + deletions). If a milestone approaches 800 lines, it MUST be split before commit.

#### Scenario: Milestone under 800 lines

- GIVEN milestone M2.1 (Supplier CRUD) is complete
- WHEN the commit is inspected
- THEN changed lines are ≤ 800

#### Scenario: Milestone approaching limit triggers split

- GIVEN a milestone is approaching 800 changed lines
- WHEN the developer detects this before commit
- THEN the milestone is split into sub-milestones before committing

### Requirement: Documentation Synchronization

`docs/terminal-todo.md` MUST be updated with `[x]` after each milestone commit. All documentation artifacts MUST be consistent with the implemented state.

#### Scenario: Terminal todo updated after commit

- GIVEN milestone M0.2 is committed
- WHEN `docs/terminal-todo.md` is inspected
- THEN M0.2 is marked `[x]`

#### Scenario: All milestones marked complete at GMVP

- GIVEN all milestones are committed
- WHEN `docs/terminal-todo.md` is inspected at GMVP
- THEN every milestone shows `[x]`
