# Category Management Specification

## Purpose

CRUD operations for categories with block-delete protection: a category referenced by any invoice line MUST NOT be deleted.

## Requirements

### Requirement: Create Category

The system SHALL allow creating a category with a required name. Name MUST be trimmed and unique (case-insensitive). The change MUST preserve the baseline `Category` contract and SHALL NOT add a description field.

#### Scenario: Create with valid name

- GIVEN no category exists with name "Electronics"
- WHEN the user submits with name "Electronics"
- THEN a category is created with the given name

#### Scenario: Reject duplicate name

- GIVEN category "electronics" exists
- WHEN the user submits with name "Electronics"
- THEN the system rejects with a uniqueness error

#### Scenario: Reject empty name

- GIVEN the create form is open
- WHEN the user submits with an empty or whitespace-only name
- THEN the system rejects with a validation error

### Requirement: List Categories

The system SHALL display all categories. An empty-state prompt MUST appear when no categories exist.

#### Scenario: List shows all categories

- GIVEN 6 categories exist
- WHEN the category list page loads
- THEN all 6 categories are displayed

#### Scenario: Empty list shows create prompt

- GIVEN no categories exist
- WHEN the category list page loads
- THEN an empty-state message and a "New Category" action are shown

### Requirement: Edit Category

The system SHALL allow editing the name. Uniqueness MUST be re-checked excluding self.

#### Scenario: Edit name succeeds for unique value

- GIVEN category "Food" exists and "Drinks" exists
- WHEN the user edits "Food" to "Snacks"
- THEN the update succeeds

#### Scenario: Edit name rejects duplicate

- GIVEN categories "Food" and "Drinks" exist
- WHEN the user edits "Food" to "Drinks"
- THEN the system rejects with a uniqueness error

### Requirement: Block-Delete Referenced Category

The system MUST reject deletion of any category referenced by at least one invoice line. A clear error message MUST explain why deletion is blocked, including the reference count.

#### Scenario: Delete unreferenced category

- GIVEN category "Misc" is not referenced by any invoice line
- WHEN the user confirms deletion
- THEN the category is removed from the list

#### Scenario: Block delete of referenced category

- GIVEN category "Electronics" is referenced by 2 invoice lines
- WHEN the user attempts deletion
- THEN the system rejects with an error: "Cannot delete: referenced by 2 invoice line(s)"

#### Scenario: Block delete shows reference count

- GIVEN category "Food" is referenced by 1 invoice line
- WHEN the user attempts deletion
- THEN the error message includes the count "1 invoice line(s)"

### Requirement: Category Routing

Category pages MUST use routes: `/categories` (list), `/categories/new` (create), `/categories/:id/edit` (edit). Navigation MUST use client-side routing.

#### Scenario: Navigate from list to create

- GIVEN the category list page is rendered
- WHEN the user clicks the "New Category" link
- THEN the browser navigates to `/categories/new`
