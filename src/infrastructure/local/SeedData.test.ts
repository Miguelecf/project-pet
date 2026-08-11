import { expect, it } from 'vitest'
import { SEED_DATA, SEED_DATA_VERSION } from './SeedData'

it('provides a deterministic fake dataset spanning the demo states', () => {
  expect(SEED_DATA_VERSION).toBeGreaterThan(0)
  expect(SEED_DATA.seedDataVersion).toBe(SEED_DATA_VERSION)
  expect(SEED_DATA.suppliers).toHaveLength(2)
  expect(SEED_DATA.categories).toHaveLength(6)
  expect(SEED_DATA.invoices).toHaveLength(3)
  expect(SEED_DATA.dailyIncomes).toHaveLength(2)
  expect(SEED_DATA.suppliers.map((supplier) => supplier.name)).toEqual(['Demo Supplier A', 'Demo Supplier B'])
  expect(SEED_DATA.invoices.map((invoice) => invoice.status)).toEqual(['pending', 'partially_paid', 'paid'])
  expect(SEED_DATA.invoices.filter((invoice) => invoice.dueDate !== null && invoice.dueDate < '2026-08-10')).toHaveLength(1)
  expect(SEED_DATA.payments.map((payment) => payment.amountMinor)).toEqual([5000, 10000])
})

it('does not share mutable nested values with a copied seed envelope', () => {
  const copy = structuredClone(SEED_DATA) as { suppliers: Array<{ name: string }>; invoiceLines: Array<{ description: string }> }
  copy.suppliers[0].name = 'Changed only in copy'
  copy.invoiceLines[0].description = 'Changed only in copy'

  expect(SEED_DATA.suppliers[0].name).toBe('Demo Supplier A')
  expect(SEED_DATA.invoiceLines[0].description).toBe('Demo pending line')
})
