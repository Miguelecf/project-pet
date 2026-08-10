# Financial Rules Specification

## Purpose

Pure functions for financial calculations: line totals in minor units, invoice totals aggregation, status derivation, and rounding validation. Zero dependencies — no I/O, no side effects.

## Requirements

### Requirement: Line Total in Minor Units

The function `lineTotalMinor(quantity, unitCostMinor)` SHALL accept a positive finite quantity with at most three decimal places and a non-negative safe-integer unit cost in minor units. It MUST normalize quantity internally to thousandths, multiply using safe-integer arithmetic, and round half-up once to an integer minor-unit line total. The persisted domain field remains `InvoiceLine.quantity`; no `quantityMillis` field SHALL be persisted.

#### Scenario: Standard line total

- GIVEN quantity is 3 and unitCostMinor is 1500 (representing $15.00)
- WHEN `lineTotalMinor(3, 1500)` is called
- THEN the result is 4500

#### Scenario: Decimal quantity

- GIVEN quantity is 1.255 and unitCostMinor is 100
- WHEN `lineTotalMinor(1.255, 100)` is called
- THEN the result is 126

#### Scenario: Large quantity with small unit cost

- GIVEN quantity is 10000 and unitCostMinor is 5 (representing $0.05)
- WHEN `lineTotalMinor(10000, 5)` is called
- THEN the result is 50000

#### Scenario: Reject invalid quantity

- GIVEN quantity is 0, negative, non-finite, or has more than 3 decimals
- WHEN `lineTotalMinor(quantity, 100)` is called
- THEN the function rejects the input

### Requirement: Invoice Totals Aggregation

The function `invoiceTotals(lines)` SHALL sum all line totals to produce `subtotalMinor`, compute `taxMinor` (if applicable), and produce `totalMinor`. All values MUST be integers in minor units.

#### Scenario: Multi-line invoice totals

- GIVEN lines with totals [4500, 2000, 1500]
- WHEN `invoiceTotals(lines)` is called
- THEN `subtotalMinor` is 8000 and `totalMinor` is 8000 (no tax by default)

#### Scenario: Empty lines

- GIVEN an empty lines array
- WHEN `invoiceTotals([])` is called
- THEN `subtotalMinor` is 0 and `totalMinor` is 0

### Requirement: Invoice Status Derivation

The function `deriveStatus(totalMinor, paidMinor)` SHALL return the baseline `InvoiceStatus`: `"pending"` when `paidMinor === 0`, `"partially_paid"` when `0 < paidMinor < totalMinor`, and `"paid"` when `paidMinor === totalMinor`. Voided payments MUST NOT count. Invalid totals or `paidMinor > totalMinor` MUST be rejected; `"overpaid"` is not a status.

#### Scenario: Pending invoice

- GIVEN totalMinor is 10000 and paidMinor is 0
- WHEN `deriveStatus(10000, 0)` is called
- THEN the result is `"pending"`

#### Scenario: Partial payment

- GIVEN totalMinor is 10000 and paidMinor is 5000
- WHEN `deriveStatus(10000, 5000)` is called
- THEN the result is `"partially_paid"`

#### Scenario: Fully paid

- GIVEN totalMinor is 10000 and paidMinor is 10000
- WHEN `deriveStatus(10000, 10000)` is called
- THEN the result is `"paid"`

#### Scenario: Overpaid

- GIVEN totalMinor is 10000 and paidMinor is 12000
- WHEN `deriveStatus(10000, 12000)` is called
- THEN the function rejects the invalid overpayment

### Requirement: Rounding Validation

Financial calculations MUST handle the 0.005 rounding edge case correctly. When a calculation produces a fractional cent, the system MUST round to the nearest integer minor unit using standard rounding (half-up).

#### Scenario: 0.005 rounding edge case

- GIVEN a calculation that produces 0.005 in major units (0.5 in minor units)
- WHEN the rounding function processes this value
- THEN the result rounds up to 1 minor unit

#### Scenario: Large quantity rounding precision

- GIVEN a valid quantity with at most 3 decimals and a unit cost produces a fractional minor unit
- WHEN the calculation is performed
- THEN the result is a valid integer with no floating-point drift

### Requirement: Pure Function Contract

All financial functions MUST be pure: same inputs always produce same outputs. Functions MUST NOT read from or write to any external state, storage, or I/O.

#### Scenario: Deterministic output

- GIVEN `lineTotalMinor(7, 333)` is called
- WHEN called 100 times with the same inputs
- THEN every call returns 2331
