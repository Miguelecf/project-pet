import { expect, it } from 'vitest'
import { SEED_DATA, SEED_DATA_VERSION } from './SeedData'

it('provides a deterministic fake dataset spanning the demo states', () => {
  expect(SEED_DATA_VERSION).toBeGreaterThan(0)
  expect(SEED_DATA.seedDataVersion).toBe(SEED_DATA_VERSION)
  expect(SEED_DATA.suppliers).toHaveLength(8)
  expect(SEED_DATA.categories).toHaveLength(10)
  expect(SEED_DATA.invoices).toHaveLength(30)
  expect(SEED_DATA.dailyIncomes).toHaveLength(15)
  expect(SEED_DATA.suppliers.slice(0, 2).map((supplier) => supplier.name)).toEqual(['Laboratorio VetSalud', 'Distribuidora Huellitas'])
  expect(SEED_DATA.invoices.filter((invoice) => invoice.status === 'pending')).toHaveLength(10)
  expect(SEED_DATA.invoices.filter((invoice) => invoice.status === 'partially_paid')).toHaveLength(10)
  expect(SEED_DATA.invoices.filter((invoice) => invoice.status === 'paid')).toHaveLength(10)
  expect(SEED_DATA.invoices.slice(0, 3).map((invoice) => [invoice.id, invoice.status])).toEqual([
    ['demo-invoice-pending', 'pending'],
    ['demo-invoice-partial', 'partially_paid'],
    ['demo-invoice-paid', 'paid'],
  ])
  expect(SEED_DATA.invoices.filter((invoice) => invoice.dueDate !== null && invoice.dueDate < '2026-08-10')).toHaveLength(20)
  expect(SEED_DATA.payments).toHaveLength(20)
})

it('does not share mutable nested values with a copied seed envelope', () => {
  const copy = structuredClone(SEED_DATA) as { suppliers: Array<{ name: string }>; invoiceLines: Array<{ description: string }> }
  copy.suppliers[0].name = 'Changed only in copy'
  copy.invoiceLines[0].description = 'Changed only in copy'

  expect(SEED_DATA.suppliers[0].name).toBe('Laboratorio VetSalud')
  expect(SEED_DATA.invoiceLines[0].description).toBe('Antibióticos')
})
