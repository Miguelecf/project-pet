# Apply Progress: Local Demonstrable MVP

## M0.2 complete

Async, module-specific repository contracts and reusable adapter contract suites
are ready for local adapter implementation in M0.3. No adapter, UI, or M0.3
behavior was implemented.

## Completed tasks

- [x] 0.2.1–0.2.6: Added reusable supplier, category, settings, invoice,
  payment, and daily-income contract suites.
- [x] 0.2.7–0.2.12: Added the six async, per-module repository interfaces.
- [x] 0.2.13: Confirmed there is no `CrudRepository<T>` or `BaseRepository`.

## TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | Triangulate | Refactor |
|---|---|---|---|---|---|---|---|
| 0.2.1 | `supplierRepositoryContract.ts` | Unit contract | N/A (new) | `npm run build` failed: missing `SupplierRepository` | Interface added; build passed | CRUD + duplicate-name paths | Interface-only contract clean |
| 0.2.2 | `categoryRepositoryContract.ts` | Unit contract | N/A (new) | `npm run build` failed: missing `CategoryRepository` | Interface added; build passed | CRUD + duplicate-name paths | Interface-only contract clean |
| 0.2.3 | `settingsRepositoryContract.ts` | Unit contract | N/A (new) | `npm run build` failed: missing `SettingsRepository` | Interface added; build passed | defaults + rejected-save paths | Interface-only contract clean |
| 0.2.4 | `invoiceRepositoryContract.ts` | Unit contract | N/A (new) | `npm run build` failed: missing `InvoiceRepository` | Interface added; build passed | active/deleted query paths | Interface-only contract clean |
| 0.2.5 | `paymentRepositoryContract.ts` | Unit contract | N/A (new) | `npm run build` failed: missing `PaymentRepository` | Interface added; build passed | register/void + rejection paths | Interface-only contract clean |
| 0.2.6 | `dailyIncomeRepositoryContract.ts` | Unit contract | N/A (new) | `npm run build` failed: missing `DailyIncomeRepository` | Interface added; build passed | CRUD + duplicate-date paths | Interface-only contract clean |
| 0.2.7–0.2.12 | Repository interfaces | Type-level | N/A (new) | Covered by the six missing-module compile failures | `npm run build` passed | Skipped: structural declarations | Names and module boundaries reviewed |
| 0.2.13 | Repository contract tree | Static inspection | N/A (new) | N/A | `CrudRepository|BaseRepository` search returned no matches | Skipped: one structural outcome | Interface segregation retained |

## Command evidence

- RED: `npm run build` exited non-zero because all six repository modules were
  absent (`TS2307`).
- GREEN: `npm run build` passed after the contracts were added.
- Final: `npm run test:run` passed (3 files, 20 tests); `npm run build` and
  `npm run lint` passed.

## Delivery boundary

- Strategy: approved `size:exception`, single mainline milestone commit.
- Scope: M0.2 only; M0.3 adapters and all UI remain pending.
- Rollback: revert this milestone before any adapter or consumer milestone.
