# Local MVP guided demo

Use this walkthrough to validate the complete local financial-operations flow with a product owner. It demonstrates a deterministic sample dataset and ends by restoring that dataset.

## Preconditions

- Use a supported desktop browser in a single tab.
- Start from the local demo application. This is a local-only MVP: there is no account, login, cloud synchronization, shared workspace, or connected client data.
- For the seeded period examples, use a device date of 12 August 2026. The sample records are deterministic, while dashboard periods follow the device calendar.
- Treat all names, references, and values as fake demonstration data. Do not enter production or personal data.

## Open the local demo

1. Start the local demo and open the address shown by the local environment.
2. Confirm the header identifies the product as local demo mode.
3. Confirm the footer states that no account, cloud sync, or client data is connected.

Expected result: the Dashboard opens without a sign-in step.

## Review the seeded dashboard

1. On the Dashboard, review the financial overview, current-week income, latest invoices, paid-expense categories, and due alerts.
2. Confirm the seeded data includes three demo invoices: one pending, one partially paid, and one paid.
3. Confirm an overdue invoice alert is visible and that two daily-income records are available in the seeded period.
4. Read the financial-result label carefully: Estimated cash result — not net profit.

Expected result: the dashboard presents a repeatable starting point using fake data only.

## Review catalogs

1. Open Suppliers and confirm the two demo suppliers are listed.
2. Open Categories and confirm the six demo categories are listed.
3. Optionally create a clearly named temporary supplier or category, then return to the relevant list to confirm it appears.

Expected result: catalog changes are visible locally in this browser only. The final restore removes temporary demo changes.

## Create an invoice

1. Open Invoices and select Create invoice.
2. Choose a demo supplier, enter a reference such as DEMO-NEW, and use today’s date as the issue date.
3. Add one line, choose a demo category, and enter a product reference, description, positive quantity, and a valid non-negative amount.
4. Save the invoice and open its detail page.

Expected result: the new invoice is pending, its line and total are visible, and its balance equals its total.

## Register a partial payment

1. On the new invoice, enter a payment amount lower than the remaining balance.
2. Use today’s date, choose a payment method, and register the payment.
3. Review the invoice status and balance.

Expected result: the invoice becomes partially paid and the remaining balance decreases by the payment amount.

## Complete the payment

1. Enter a second payment equal to the remaining balance.
2. Use today’s date and register the payment.
3. Review the payment history, status, and balance.

Expected result: the invoice becomes paid and its remaining balance is zero. An amount above the remaining balance must be rejected.

## Void a payment

1. Enter a reason for voiding one of the active payments.
2. Select Void payment and review the confirmation dialog.
3. Confirm the void, then review the invoice status and balance.

Expected result: the payment remains in the history as voided, no longer counts as paid, and the balance and status recalculate. Canceling the confirmation must leave the payment unchanged.

## Record daily income

1. Open Daily income and select New daily income.
2. Enter today’s date, a positive amount, and an optional note such as Local demo income.
3. Save the record and return to the Dashboard.

Expected result: the new daily income appears in its list and affects the selected dashboard period when its date is included.

## Validate dashboard behavior

1. Use Day, Week, and Month to switch the dashboard period.
2. For each period, confirm that period income, paid expenses, estimated cash result, and the Paid-expense categories breakdown change only for included dates.
3. Confirm that estimated cash result remains labeled as not net profit.
4. Confirm total outstanding, invoice-status counts, latest invoices, and due alerts remain operational snapshots rather than period-only figures.
5. Confirm the current-week income list shows seven dates, including zero values where no income was recorded.
6. Confirm the inactivity alert appears when there is no daily income in the recent seven-day window and clears when qualifying income exists.

Expected result: the dashboard makes cash movement visible without presenting it as profit, and its periods, alerts, metrics, and category totals respond predictably to local demo activity.

## Restore demo data

1. On the Dashboard, select Restore demo data.
2. Read the visible confirmation message stating that local demo data will be replaced.
3. Select Restore demo data in the confirmation dialog.
4. Wait for the visible success message, then refresh the dashboard if you want to review the restored starting state.

Expected result: all local changes made during the walkthrough are replaced by the original deterministic fake dataset. Selecting Cancel must preserve the current local data. If restoration reports an error, use Retry restore demo data; if it continues to fail, keep the tab open and record what was visible before retrying.

## Recovery notes

- Restore demo data is the normal recovery action after an interrupted or exploratory walkthrough.
- If the local demo is unavailable, restart the local environment and reopen the application. No remote account or cloud copy exists to recover from.
- Do not rely on this MVP for production records, concurrent use, or data sharing. Repeat the walkthrough only with fake data.
- If dates make seeded period totals appear unexpected, verify the device calendar and use the precondition date before judging period behavior.

## Client validation questions

1. Does the seeded starting state make the financial workflow understandable without an explanation of the underlying product?
2. Are the catalog, invoice, payment, void, and daily-income steps named and ordered in a way that matches the team’s daily work?
3. Is the distinction between estimated cash result and net profit sufficiently clear?
4. Do the day, week, and month views show the information needed for operational decisions?
5. Are the category breakdown, inactivity message, and due alerts useful and understandable?
6. Is the visible restore confirmation clear enough to safely reset a demo after changes?
7. Which fake data, labels, or workflow steps should change before any future multi-user or cloud-connected product phase?
