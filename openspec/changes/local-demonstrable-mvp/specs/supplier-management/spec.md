# Supplier Management Specification

## Purpose

CRUD operations for suppliers with soft-delete semantics and normalized-name uniqueness enforcement.

## Requirements

### Requirement: Create Supplier

The system SHALL allow creating a supplier with a required name. The name MUST be trimmed and lowercased for uniqueness comparison. On success, the supplier receives a generated ID and `deletedAt: null`.

#### Scenario: Create with valid name

- GIVEN no supplier exists with name "acme corp"
- WHEN the user submits a create form with name "  Acme Corp  "
- THEN a supplier is created with `name: "Acme Corp"`, a generated ID, and `deletedAt: null`

#### Scenario: Reject duplicate normalized name

- GIVEN a supplier exists with name "Acme Corp"
- WHEN the user submits a create form with name "acme corp"
- THEN the system rejects creation with a uniqueness error message

#### Scenario: Reject empty name

- GIVEN the create form is open
- WHEN the user submits with an empty or whitespace-only name
- THEN the system rejects with a validation error

### Requirement: List Suppliers

The system SHALL display all non-deleted suppliers. Soft-deleted suppliers MUST NOT appear in the list.

#### Scenario: List excludes soft-deleted

- GIVEN 2 active suppliers and 1 soft-deleted supplier exist
- WHEN the supplier list page loads
- THEN only 2 suppliers are displayed

#### Scenario: Empty list shows prompt

- GIVEN no suppliers exist
- WHEN the supplier list page loads
- THEN an empty-state message and a "Create Supplier" action are shown

### Requirement: Edit Supplier

The system SHALL allow editing a supplier's name. Uniqueness MUST be re-checked against other non-deleted suppliers (excluding self).

#### Scenario: Edit name to unique value

- GIVEN supplier "Alpha" exists and supplier "Beta" exists
- WHEN the user edits "Alpha" to "Gamma"
- THEN the update succeeds

#### Scenario: Edit name to existing value rejects

- GIVEN supplier "Alpha" and "Beta" exist
- WHEN the user edits "Alpha" to "Beta"
- THEN the system rejects with a uniqueness error

### Requirement: Soft Delete Supplier

The system SHALL soft-delete by setting `deletedAt` to the current timestamp. The supplier MUST remain in storage. A confirmation dialog MUST precede deletion.

#### Scenario: Soft delete sets deletedAt

- GIVEN supplier "Alpha" with `deletedAt: null`
- WHEN the user confirms deletion
- THEN `deletedAt` is set to a non-null timestamp and the supplier disappears from the list

#### Scenario: Cancel delete preserves supplier

- GIVEN supplier "Alpha" is shown
- WHEN the user cancels the confirmation dialog
- THEN the supplier remains unchanged with `deletedAt: null`

### Requirement: Supplier Routing

Supplier pages MUST be accessible via routes: `/suppliers` (list), `/suppliers/new` (create), `/suppliers/:id/edit` (edit). Navigation MUST use client-side routing.

#### Scenario: Navigate from list to edit

- GIVEN the supplier list shows "Alpha"
- WHEN the user clicks the edit link for "Alpha"
- THEN the browser navigates to `/suppliers/:id/edit` and the edit form renders with pre-filled data
