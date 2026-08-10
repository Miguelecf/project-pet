# Dashboard Specification

## Purpose

Central dashboard page displaying financial metrics, due-date alerts, and daily income summary for the demo walkthrough.

## Requirements

### Requirement: Metrics Panel

The system SHALL display a metrics panel with: total outstanding (sum of active `pending` and `partially_paid` invoice balances), total income this month (sum of daily incomes for current month), and active invoice count by baseline status. Soft-deleted invoices MUST be excluded.

#### Scenario: Metrics with seed data

- GIVEN seed data with 3 invoices (`pending`, `partially_paid`, `paid`) and 2 daily incomes
- WHEN the dashboard loads
- THEN metrics show correct outstanding, monthly income, and status counts

#### Scenario: Metrics with no data

- GIVEN no invoices or daily incomes exist
- WHEN the dashboard loads
- THEN metrics show zero values and a prompt to seed data

#### Scenario: Metrics recalculate on data change

- GIVEN the dashboard is displayed
- WHEN a new invoice is created through the same provider-backed application
- THEN metrics update to reflect the new invoice

### Requirement: Due-Date Alert Widget

The system SHALL display a widget listing invoices with due dates within the next 7 days or past due. Each entry MUST show the invoice number, due date, and outstanding balance. Overdue invoices MUST be visually distinguished (e.g., red highlight).

#### Scenario: Show overdue invoices

- GIVEN an invoice has due date 2 days ago
- WHEN the dashboard loads
- THEN the widget lists the invoice with an "Overdue" badge and red highlight

#### Scenario: Show upcoming due invoices

- GIVEN an invoice has due date 3 days from now
- WHEN the dashboard loads
- THEN the widget lists the invoice with a "Due soon" badge

#### Scenario: No alerts when all invoices are current

- GIVEN all invoices have due dates more than 7 days from now
- WHEN the dashboard loads
- THEN the widget shows "No upcoming or overdue invoices"

#### Scenario: Date boundary — exactly 7 days

- GIVEN an invoice has due date exactly 7 days from now
- WHEN the dashboard loads
- THEN the invoice appears in the widget as "Due soon"

### Requirement: Daily Income Summary

The system SHALL display a summary of daily incomes for the current week (Monday through Sunday). Each day with income MUST show the total amount.

#### Scenario: Weekly summary with data

- GIVEN daily incomes exist for Monday and Wednesday of the current week
- WHEN the dashboard loads
- THEN the summary shows amounts for Monday and Wednesday, zeros for other days

#### Scenario: Weekly summary with no data

- GIVEN no daily incomes exist for the current week
- WHEN the dashboard loads
- THEN all days show zero

### Requirement: Dashboard Routing

The dashboard MUST be accessible at `/`. It MUST be the default landing page.

#### Scenario: Default route shows dashboard

- GIVEN the app is loaded with no path
- WHEN the browser navigates to the root URL
- THEN the Dashboard page renders

### Requirement: Dashboard Accessibility

All metric values MUST have accessible labels. The due-date widget MUST use semantic list markup. Color MUST NOT be the only indicator of overdue status (text badge required).

#### Scenario: Screen reader announces metrics

- GIVEN a screen reader is active on the dashboard
- WHEN focus moves to the metrics panel
- THEN each metric value is announced with its label (e.g., "Total outstanding: 5000")
