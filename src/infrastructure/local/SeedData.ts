import type { LocalState } from './LocalStateSchema'

export const SEED_DATA_VERSION = 2

const timestamp = '2026-08-10T00:00:00.000Z' as never
const currency = 'ARS' as const
const supplierNames = [
  ['Laboratorio VetSalud', 30],
  ['Distribuidora Huellitas', 15],
  ['Alimentos Sanos', 20],
  ['Equipamiento Animalia', 45],
  ['PetClean Insumos', 30],
  ['BioDiagnóstico', 15],
  ['Frío Clínico', 30],
  ['Mundo Canino', 20],
] as const
const categoryNames = ['Medicamentos', 'Vacunas', 'Alimentos', 'Material descartable', 'Higiene', 'Accesorios', 'Laboratorio', 'Cirugía', 'Internación', 'Mantenimiento']
const productNames = ['Antibióticos', 'Vacunas', 'Alimento balanceado', 'Jeringas y gasas', 'Shampoo medicado', 'Collares', 'Reactivos', 'Suturas', 'Mantas', 'Reparación de equipo']

function dateFromOffset(offset: number): string {
  const date = new Date(Date.UTC(2026, 7, 10 + offset))
  return date.toISOString().slice(0, 10)
}

const suppliers = supplierNames.map(([name, defaultDueDays], index) => ({
  id: (index === 0 ? 'demo-supplier-a' : index === 1 ? 'demo-supplier-b' : `vet-supplier-${index + 1}`) as never,
  name,
  normalizedName: name.toLowerCase(),
  defaultDueDays: defaultDueDays as never,
  deletedAt: null,
  createdAt: timestamp,
  updatedAt: timestamp,
}))

const categories = categoryNames.map((name, index) => ({
  id: (index < 6 ? `demo-category-${index + 1}` : `vet-category-${index + 1}`) as never,
  name,
  normalizedName: name.toLowerCase(),
  createdAt: timestamp,
  updatedAt: timestamp,
}))

const invoices = Array.from({ length: 30 }, (_, index) => {
  const number = index + 1
  const totalMinor = (12000 + (index % 6) * 8500) as never
  const status = index === 0 || index >= 3 && index < 12 ? 'pending' : index === 1 || index >= 12 && index < 21 ? 'partially_paid' : 'paid'
  return {
    id: (number === 1 ? 'demo-invoice-pending' : number === 2 ? 'demo-invoice-partial' : number === 3 ? 'demo-invoice-paid' : `vet-invoice-${number}`) as never,
    supplierId: suppliers[index % suppliers.length].id,
    docRef: number <= 3 ? `DEMO-${number}00` : `VET-${String(number).padStart(4, '0')}`,
    issueDate: dateFromOffset(-45 + index) as never,
    dueDate: dateFromOffset(-12 + (index % 22)) as never,
    currency,
    totalMinor,
    status: status as never,
    notes: `Compra de ${productNames[index % productNames.length].toLowerCase()}`,
    deletedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
})

const invoiceLines = invoices.map((invoice, index) => {
  const unitCostMinor = invoice.totalMinor
  return {
    id: (index === 0 ? 'demo-line-pending' : index === 1 ? 'demo-line-partial' : index === 2 ? 'demo-line-paid' : `vet-line-${index + 1}`) as never,
    invoiceId: invoice.id,
    categoryId: categories[index % categories.length].id,
    productRef: `PROD-${String(index + 1).padStart(3, '0')}`,
    externalSku: `VETSKU-${index + 1}`,
    description: productNames[index % productNames.length],
    quantity: 1 as never,
    unitCostMinor,
    lineTotalMinor: unitCostMinor,
    position: 1 as never,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
})

const payments = invoices.filter((invoice) => invoice.status !== 'pending').map((invoice, index) => {
  const amountMinor = invoice.status === 'paid' ? invoice.totalMinor : Math.floor(Number(invoice.totalMinor) / 2)
  return {
    id: (index === 0 ? 'demo-payment-partial' : index === 1 ? 'demo-payment-paid' : `vet-payment-${index + 1}`) as never,
    invoiceId: invoice.id,
    amountMinor: amountMinor as never,
    paymentDate: dateFromOffset(-20 + index) as never,
    method: (index % 2 === 0 ? 'bank_transfer' : 'cash') as never,
    reference: `PAGO-VET-${index + 1}`,
    notes: invoice.status === 'paid' ? 'Pago completo' : 'Pago parcial',
    createdAt: timestamp,
    isVoid: false as const,
    voidedAt: null,
    voidReason: null,
  }
})

const dailyIncomes = Array.from({ length: 15 }, (_, index) => ({
  id: `vet-income-${index + 1}` as never,
  saleDate: dateFromOffset(-14 + index) as never,
  amountMinor: (38000 + (index % 5) * 12500) as never,
  currency,
  note: ['Consulta clínica', 'Venta de alimento', 'Vacunación', 'Peluquería', 'Control de rutina'][index % 5],
  createdAt: timestamp,
  updatedAt: timestamp,
}))

export const SEED_DATA: LocalState & { seedDataVersion: typeof SEED_DATA_VERSION } = {
  seedDataVersion: SEED_DATA_VERSION,
  schemaVersion: 1,
  settings: { currency, dueAlertDays: 7 as never, createdAt: timestamp, updatedAt: timestamp },
  suppliers,
  categories,
  invoices,
  invoiceLines,
  payments,
  dailyIncomes,
}
