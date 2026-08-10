# Repository Contracts Specification

## Purpose

Define async per-module repository interfaces and shared contract test functions that guarantee behavioral parity across any adapter implementation.

## Requirements

### Requirement: Async Per-Module Interfaces

The system SHALL define a dedicated async repository interface for each domain module (suppliers, categories, settings, invoices, payments, daily-income). Each interface MUST declare only the methods relevant to its module. No generic `CrudRepository<T>` SHALL exist.

#### Scenario: Each module has its own interface

- GIVEN the codebase has modules for suppliers, categories, settings, invoices, payments, and daily-income
- WHEN inspecting repository contracts
- THEN each module defines a distinct async interface with only its required methods

#### Scenario: All methods return Promise

- GIVEN any repository interface method
- WHEN the method signature is inspected
- THEN the return type is `Promise<T>` for the appropriate domain type

### Requirement: Shared Contract Test Functions

The system SHALL provide a shared test function per module that accepts any adapter implementation and validates full behavioral conformance. Contract tests MUST cover CRUD operations, edge cases, and error propagation.

#### Scenario: Contract test passes against local adapter

- GIVEN a shared contract test function for suppliers
- WHEN executed with the localStorage adapter
- THEN all assertions pass (create, read, update, soft-delete, list)

#### Scenario: Contract test detects non-conforming adapter

- GIVEN a shared contract test function for categories
- WHEN executed with a mock adapter that returns wrong data on `findById`
- THEN the test fails with a descriptive assertion message

#### Scenario: Contract tests cover error paths

- GIVEN a shared contract test function for invoices
- WHEN the adapter throws on a method call
- THEN the contract test verifies the error propagates as a rejected Promise

### Requirement: No Generic CRUD Abstraction

The system MUST NOT define a single generic `CrudRepository<T>` or base repository class. Each module's interface MUST be independently defined.

#### Scenario: No shared base repository exists

- GIVEN the repository contract files
- WHEN searching for a generic `CrudRepository` or `BaseRepository` type
- THEN no such type is found in the codebase

### Requirement: Contract Interface Segregation

Each repository interface MUST only expose methods that its module's consumers need. Interfaces SHALL NOT include unused methods for the sake of symmetry.

#### Scenario: Settings repository has only get and save

- GIVEN the settings module only needs singleton read/write
- WHEN inspecting the settings repository interface
- THEN it exposes only `get()` and `save(settings)` — no `findAll`, `delete`, or `create`

#### Scenario: Invoice repository includes domain-specific queries

- GIVEN the invoice module needs status filtering and line management
- WHEN inspecting the invoice repository interface
- THEN it includes methods for status queries and line operations beyond basic CRUD
