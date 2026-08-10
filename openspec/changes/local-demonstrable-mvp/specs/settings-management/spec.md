# Settings Management Specification

## Purpose

Singleton settings CRUD with currency-lock enforcement: currency MUST NOT be changed when financial records (invoices or daily incomes) exist with a different currency.

## Requirements

### Requirement: Read Settings

The system SHALL return the current settings singleton. If no settings exist, the system MUST return baseline-compatible defaults (`currency: "USD"` and a non-negative `dueAlertDays`). Currency MUST be either `ARS` or `USD`.

#### Scenario: Read existing settings

- GIVEN settings have been saved with currency "ARS"
- WHEN the user navigates to Settings
- THEN the form displays currency "ARS"

#### Scenario: Read defaults when no settings saved

- GIVEN no settings exist in storage
- WHEN the user navigates to Settings
- THEN the form displays currency "USD" and the default non-negative due-alert days

### Requirement: Save Settings

The system SHALL persist the settings singleton. Before saving, the system MUST validate the currency-lock rule.

#### Scenario: Save with no financial records

- GIVEN no invoices or daily incomes exist
- WHEN the user changes currency to "ARS" and saves
- THEN settings are persisted with currency "ARS"

#### Scenario: Save same currency with financial records

- GIVEN invoices exist with currency "USD" and user saves with currency "USD"
- WHEN the user saves
- THEN settings are persisted successfully

### Requirement: Currency-Lock Enforcement

The system MUST reject a settings save if any invoice or daily-income record exists with a currency different from the one being saved. The rejection MUST occur before any mutation. A user-facing error message MUST explain the lock.

#### Scenario: Reject currency change with existing invoices

- GIVEN invoices exist with currency "USD"
- WHEN the user changes currency to "ARS" and saves
- THEN the save is rejected with error: "Cannot change currency: N invoice(s) exist with USD"

#### Scenario: Reject currency change with existing daily incomes

- GIVEN daily incomes exist with currency "USD"
- WHEN the user changes currency to "ARS" and saves
- THEN the save is rejected with error: "Cannot change currency: N daily income(s) exist with USD"

#### Scenario: Allow due-alert-days change with financial records

- GIVEN invoices exist with currency "USD"
- WHEN the user changes `dueAlertDays` to 10 but keeps currency "USD" and saves
- THEN settings are persisted successfully

#### Scenario: Currency lock checks both invoices and daily incomes

- GIVEN 3 invoices and 2 daily incomes exist with currency "USD"
- WHEN the user changes currency to "ARS" and saves
- THEN the error message references both record types

### Requirement: Settings Routing

Settings page MUST be accessible via `/settings`. The page MUST render a form with save button.

#### Scenario: Navigate to settings

- GIVEN the app is loaded
- WHEN the user navigates to `/settings`
- THEN the Settings form renders with current values
