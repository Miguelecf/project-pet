# Local Persistence Specification

## Purpose

Provide a versioned localStorage adapter with defensive parsing, deterministic seed loading, and restore capability for the local demonstrable MVP.

## Requirements

### Requirement: Versioned Storage Key

The adapter SHALL read and write under the key `project-pet-v{SCHEMA_VERSION}`. `SCHEMA_VERSION` MUST be a positive integer constant. On read, if the key is missing, empty, malformed, or version-mismatched, the adapter MUST degrade to an empty state and signal a seed prompt.

#### Scenario: Normal read with matching version

- GIVEN localStorage contains valid JSON at key `project-pet-v1`
- WHEN the adapter reads the key
- THEN the parsed state object is returned

#### Scenario: Missing key degrades to empty state

- GIVEN localStorage has no key matching `project-pet-v*`
- WHEN the adapter reads
- THEN an empty state object is returned and `needsSeed` flag is true

#### Scenario: Malformed JSON degrades gracefully

- GIVEN localStorage contains invalid JSON at the versioned key
- WHEN the adapter reads
- THEN an empty state is returned, no exception propagates, and `needsSeed` is true

#### Scenario: Version mismatch degrades gracefully

- GIVEN localStorage contains data at `project-pet-v0` but adapter expects `v1`
- WHEN the adapter reads
- THEN an empty state is returned and `needsSeed` is true

### Requirement: Defensive Parse on Read

The adapter MUST wrap `JSON.parse` in a try-catch. On any parse failure, the adapter SHALL return an empty state object with all module collections initialized to empty arrays/objects.

#### Scenario: Corrupted data does not crash the app

- GIVEN localStorage value is `"{invalid json"`
- WHEN the adapter reads
- THEN the app continues with empty state and no unhandled exception

#### Scenario: Null value treated as empty

- GIVEN localStorage returns `null` for the versioned key
- WHEN the adapter reads
- THEN empty state is returned

### Requirement: Deterministic Seed Loading

The adapter SHALL provide a `loadSeed()` method that writes the inline `SEED_DATA` constant to localStorage under the current versioned key. `SEED_DATA` MUST include a `SEED_DATA_VERSION` field. Seed data MUST contain: 2 suppliers, 6 categories, 3 invoices (`pending`/`partially_paid`/`paid`), 2 daily incomes, 1 overdue invoice.

#### Scenario: Seed populates all collections

- GIVEN an empty or corrupted store
- WHEN `loadSeed()` is called
- THEN localStorage contains the full seed dataset and all collections are populated

#### Scenario: Seed overwrites existing data

- GIVEN localStorage has user-modified data
- WHEN `loadSeed()` is called
- THEN all data is replaced with the deterministic seed

#### Scenario: Seed data contains no real names or amounts

- GIVEN the seed data constant
- WHEN inspecting supplier names and invoice amounts
- THEN values are obviously fake (e.g., "Demo Supplier A", round amounts)

### Requirement: Restore to Seed State

The adapter SHALL provide a `restore()` method that resets localStorage to the exact seed state. Restore MUST be deterministic — calling it twice produces identical state.

#### Scenario: Restore after modifications

- GIVEN a user has created, edited, and deleted various records
- WHEN `restore()` is called
- THEN localStorage matches the original seed data exactly

#### Scenario: Restore is idempotent

- GIVEN the store is already in seed state
- WHEN `restore()` is called again
- THEN the state remains identical

### Requirement: Write Atomicity

Each write operation MUST serialize the entire state object to localStorage in a single `setItem` call. Partial writes MUST NOT occur.

The adapter MUST clone and validate the complete next envelope before writing. If serialization or `setItem` fails, it MUST reject with a persistence error and MUST NOT publish the candidate state or provider revision. The previous valid stored state remains the recovery boundary.

#### Scenario: Single write per mutation

- GIVEN a supplier is created
- WHEN the repository persists the change
- THEN exactly one `localStorage.setItem` call occurs with the full state

### Requirement: Persistence Across Page Refresh

Data written to localStorage MUST survive a browser page refresh within the same origin.

#### Scenario: Data survives refresh

- GIVEN a supplier was created and persisted
- WHEN the page is refreshed
- THEN the supplier is present in the reloaded state
