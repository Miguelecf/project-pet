# App Shell Specification

## Purpose

Provide the application shell: BrowserRouter routing, Layout with Sidebar navigation, StateOverlay for async states, ConfirmDialog, skip-link accessibility, and focus management.

## Requirements

### Requirement: BrowserRouter Route Map

The system SHALL use React Router's `BrowserRouter` with the following routes: `/` (Dashboard), `/suppliers` (list/create/edit), `/categories` (list/create/edit), `/invoices` (list/create/edit/detail), `/daily-income` (list/create/edit), `/settings`. Unknown routes SHALL redirect to `/`.

#### Scenario: Navigate to dashboard

- GIVEN the app is loaded
- WHEN the user navigates to `/`
- THEN the Dashboard page renders

#### Scenario: Navigate to supplier list

- GIVEN the app is loaded
- WHEN the user navigates to `/suppliers`
- THEN the Supplier List page renders

#### Scenario: Unknown route redirects to dashboard

- GIVEN the app is loaded
- WHEN the user navigates to `/nonexistent`
- THEN the browser redirects to `/`

### Requirement: Layout with Sidebar

The Layout component SHALL render a persistent Sidebar with navigation links to all module routes. The Sidebar MUST be visible on viewports ≥ 768px. Below 768px, the Sidebar SHALL collapse into a hamburger menu.

#### Scenario: Desktop sidebar visible

- GIVEN viewport width is 1024px
- WHEN the Layout renders
- THEN the Sidebar is visible with all navigation links

#### Scenario: Mobile sidebar collapsed

- GIVEN viewport width is 320px
- WHEN the Layout renders
- THEN the Sidebar is hidden and a hamburger toggle is visible

#### Scenario: Mobile sidebar opens on toggle

- GIVEN viewport width is 320px and sidebar is collapsed
- WHEN the user clicks the hamburger toggle
- THEN the Sidebar slides in with all navigation links

### Requirement: StateOverlay

The system SHALL provide a `StateOverlay` component that displays loading, error, or empty states over page content. The overlay MUST be dismissible for error states and non-dismissible for loading states.

#### Scenario: Loading overlay blocks interaction

- GIVEN a page is fetching data
- WHEN StateOverlay is in loading state
- THEN a spinner is shown and underlying content is inert

#### Scenario: Error overlay is dismissible

- GIVEN a page encountered a fetch error
- WHEN StateOverlay is in error state
- THEN an error message and "Retry" button are shown

#### Scenario: Empty state overlay

- GIVEN a list has zero items
- WHEN StateOverlay is in empty state
- THEN a friendly message and optional "Create" action are shown

### Requirement: ConfirmDialog

The system SHALL provide a `ConfirmDialog` component for destructive actions. It MUST accept a title, message, confirm/cancel labels, and callbacks. The dialog MUST trap focus and close on Escape.

#### Scenario: Confirm action triggers callback

- GIVEN ConfirmDialog is open with `onConfirm` callback
- WHEN the user clicks the confirm button
- THEN `onConfirm` is called and the dialog closes

#### Scenario: Escape closes dialog

- GIVEN ConfirmDialog is open
- WHEN the user presses Escape
- THEN the dialog closes and `onCancel` is called

#### Scenario: Focus is trapped inside dialog

- GIVEN ConfirmDialog is open
- WHEN the user presses Tab repeatedly
- THEN focus cycles only within the dialog elements

### Requirement: Skip-Link Accessibility

The Layout SHALL include a skip-link as the first focusable element that targets `#main-content`. The skip-link MUST be visually hidden until focused.

#### Scenario: Skip-link visible on focus

- GIVEN the page has loaded
- WHEN the user presses Tab from the top
- THEN the skip-link becomes visible

#### Scenario: Skip-link jumps to main content

- GIVEN the skip-link is focused
- WHEN the user activates it (Enter/Space)
- THEN focus moves to the `#main-content` region

### Requirement: Focus Management on Navigation

On route change, focus SHALL move to the main content heading (`h1`) of the new page.

#### Scenario: Focus moves after navigation

- GIVEN the user is on `/suppliers`
- WHEN they navigate to `/categories`
- THEN focus is placed on the Categories page `h1` element
