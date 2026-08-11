import { describe, expect, it } from 'vitest'
import {
  LocalStateGateway,
  SCHEMA_VERSION,
  STORAGE_KEY,
  createEmptyLocalState,
} from './LocalStateGateway'
import { SEED_DATA } from './SeedData'

class MemoryStorage {
  readonly values = new Map<string, string>()
  setItemCalls = 0
  failWrites = false

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.setItemCalls += 1
    if (this.failWrites) throw new Error('storage unavailable')
    this.values.set(key, value)
  }
}

function createValidPersistedState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { currency: 'ARS', dueAlertDays: 7, createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    suppliers: [{ id: 'supplier-1', name: 'Supplier', normalizedName: 'supplier', defaultDueDays: 30, deletedAt: null, createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    categories: [{ id: 'category-1', name: 'Category', normalizedName: 'category', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    invoices: [{ id: 'invoice-1', supplierId: 'supplier-1', docRef: 'DOC-1', issueDate: '2020-01-01', dueDate: '2020-01-31', currency: 'ARS', totalMinor: 1000, status: 'paid', notes: null, deletedAt: null, createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    invoiceLines: [{ id: 'line-1', invoiceId: 'invoice-1', categoryId: 'category-1', productRef: 'Product', externalSku: null, description: 'Description', quantity: 1, unitCostMinor: 1000, lineTotalMinor: 1000, position: 1, createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    payments: [{ id: 'payment-1', invoiceId: 'invoice-1', amountMinor: 1000, paymentDate: '2020-01-01', method: 'cash', reference: null, notes: null, createdAt: '2020-01-01T00:00:00.000Z', isVoid: false, voidedAt: null, voidReason: null }],
    dailyIncomes: [{ id: 'income-1', saleDate: '2020-01-01', amountMinor: 1000, currency: 'ARS', note: null, createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
  }
}

describe('LocalStateGateway', () => {
  it('reads a matching versioned envelope without exposing its internal state', () => {
    const storage = new MemoryStorage()
    const persisted = createValidPersistedState()
    storage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    const gateway = new LocalStateGateway(storage)

    const state = gateway.read()
    state.suppliers.push({ id: 'supplier-2' } as never)

    expect(STORAGE_KEY).toBe(`project-pet-v${SCHEMA_VERSION}`)
    expect(gateway.recovery).toBe('ready')
    expect(gateway.read().suppliers).toEqual([persisted.suppliers[0]])
  })

  it.each([null, '', '{invalid json', JSON.stringify({ ...createEmptyLocalState(), schemaVersion: 0 }), JSON.stringify({ schemaVersion: 1 })])(
    'recovers to an empty seed-needed state from %j',
    (persisted) => {
      const storage = new MemoryStorage()
      if (persisted !== null) storage.values.set(STORAGE_KEY, persisted)
      const gateway = new LocalStateGateway(storage)

      expect(gateway.read()).toEqual(createEmptyLocalState())
      expect(gateway.recovery).toBe('needs_seed')
    },
  )

  it.each([
    ['settings currency', (state: ReturnType<typeof createValidPersistedState>) => { state.settings.currency = 'EUR' }],
    ['supplier required name', (state: ReturnType<typeof createValidPersistedState>) => { state.suppliers[0].name = '' }],
    ['category timestamp', (state: ReturnType<typeof createValidPersistedState>) => { state.categories[0].createdAt = 'not-a-timestamp' }],
    ['invoice supplier relationship', (state: ReturnType<typeof createValidPersistedState>) => { state.invoices[0].supplierId = 'missing-supplier' }],
    ['invoice line relationship', (state: ReturnType<typeof createValidPersistedState>) => { state.invoiceLines[0].categoryId = 'missing-category' }],
    ['payment union', (state: ReturnType<typeof createValidPersistedState>) => { state.payments[0].isVoid = true }],
    ['invoice payment status', (state: ReturnType<typeof createValidPersistedState>) => { state.invoices[0].status = 'pending' }],
    ['invoice payment balance', (state: ReturnType<typeof createValidPersistedState>) => { state.payments[0].amountMinor = 1001 }],
    ['daily income non-future date', (state: ReturnType<typeof createValidPersistedState>) => { state.dailyIncomes[0].saleDate = '2999-01-01' }],
    ['impossible invoice issue date', (state: ReturnType<typeof createValidPersistedState>) => { state.invoices[0].issueDate = '2026-02-30' }],
    ['impossible invoice due date', (state: ReturnType<typeof createValidPersistedState>) => { state.invoices[0].dueDate = '2026-02-30' }],
    ['impossible payment date', (state: ReturnType<typeof createValidPersistedState>) => { state.payments[0].paymentDate = '2026-02-30' }],
    ['impossible daily income sale date', (state: ReturnType<typeof createValidPersistedState>) => { state.dailyIncomes[0].saleDate = '2026-02-30' }],
    ['impossible entity timestamp', (state: ReturnType<typeof createValidPersistedState>) => { state.categories[0].updatedAt = '2026-02-30T00:00:00.000Z' }],
  ])('degrades malformed parseable %s records to seed-needed state', (_, mutate) => {
    const storage = new MemoryStorage()
    const persisted = createValidPersistedState()
    mutate(persisted)
    storage.values.set(STORAGE_KEY, JSON.stringify(persisted))
    const gateway = new LocalStateGateway(storage)

    expect(gateway.read()).toEqual(createEmptyLocalState())
    expect(gateway.recovery).toBe('needs_seed')
  })

  it('serializes the complete cloned envelope in one storage write', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)
    const candidate = createValidPersistedState()

    await gateway.write(candidate as never)
    candidate.categories[0].id = 'category-2'

    expect(storage.setItemCalls).toBe(1)
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '')).toMatchObject({ schemaVersion: 1, categories: [{ id: 'category-1' }] })
    expect(gateway.read().categories).toEqual([createValidPersistedState().categories[0]])
  })

  it('rejects failed writes without publishing the candidate state', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)
    const initial = createValidPersistedState()
    await gateway.write(initial as never)
    storage.failWrites = true
    const candidate = createValidPersistedState()
    candidate.suppliers[0].id = 'supplier-2'
    candidate.invoices[0].supplierId = 'supplier-2'

    await expect(gateway.write(candidate as never)).rejects.toThrow('storage unavailable')

    expect(gateway.read().suppliers).toEqual([createValidPersistedState().suppliers[0]])
    expect(gateway.recovery).toBe('ready')
  })

  it('rejects a structurally invalid candidate before attempting a write', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)
    const invalid = { ...createEmptyLocalState(), settings: [] } as never

    await expect(gateway.write(invalid)).rejects.toThrow('invalid local state envelope')

    expect(storage.setItemCalls).toBe(0)
    expect(gateway.read()).toEqual(createEmptyLocalState())
  })

  it('loads the complete deterministic seed in one atomic write without mutating the constant', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)

    await gateway.loadSeed()
    const persisted = JSON.parse(storage.getItem(STORAGE_KEY) ?? '')
    persisted.suppliers[0].name = 'Modified persisted supplier'

    expect(storage.setItemCalls).toBe(1)
    expect(gateway.read().suppliers[0]).toMatchObject({ name: 'Demo Supplier A' })
    expect(gateway.read().invoices.map((invoice) => invoice.status)).toEqual(['pending', 'partially_paid', 'paid'])
    expect(SEED_DATA.suppliers[0].name).toBe('Demo Supplier A')
  })

  it('restores an independent, deterministic seed copy after mutations', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)
    await gateway.loadSeed()
    const changed = gateway.read() as ReturnType<LocalStateGateway['read']> & { suppliers: Array<{ name: string }> }
    changed.suppliers[0].name = 'Changed state'
    await gateway.write(changed)

    await gateway.restore()
    const firstRestore = gateway.read() as ReturnType<LocalStateGateway['read']> & { categories: Array<{ name: string }> }
    firstRestore.categories[0].name = 'Changed returned copy'
    await gateway.restore()

    expect(gateway.read().suppliers[0]).toMatchObject({ name: 'Demo Supplier A' })
    expect(gateway.read().categories[0]).toMatchObject({ name: 'Demo Category A' })
    expect(storage.setItemCalls).toBe(4)
  })
})
