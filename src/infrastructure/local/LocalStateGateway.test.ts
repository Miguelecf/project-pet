import { describe, expect, it } from 'vitest'
import {
  LocalStateGateway,
  SCHEMA_VERSION,
  STORAGE_KEY,
  createEmptyLocalState,
} from './LocalStateGateway'

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

describe('LocalStateGateway', () => {
  it('reads a matching versioned envelope without exposing its internal state', () => {
    const storage = new MemoryStorage()
    const persisted = createEmptyLocalState()
    persisted.suppliers.push({ id: 'supplier-1' } as never)
    storage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    const gateway = new LocalStateGateway(storage)

    const state = gateway.read()
    state.suppliers.push({ id: 'supplier-2' } as never)

    expect(STORAGE_KEY).toBe(`project-pet-v${SCHEMA_VERSION}`)
    expect(gateway.recovery).toBe('ready')
    expect(gateway.read().suppliers).toEqual([{ id: 'supplier-1' }])
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

  it('serializes the complete cloned envelope in one storage write', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)
    const candidate = createEmptyLocalState()
    candidate.categories.push({ id: 'category-1' } as never)

    await gateway.write(candidate)
    candidate.categories.push({ id: 'category-2' } as never)

    expect(storage.setItemCalls).toBe(1)
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '')).toMatchObject({ schemaVersion: 1, categories: [{ id: 'category-1' }] })
    expect(gateway.read().categories).toEqual([{ id: 'category-1' }])
  })

  it('rejects failed writes without publishing the candidate state', async () => {
    const storage = new MemoryStorage()
    const gateway = new LocalStateGateway(storage)
    const initial = createEmptyLocalState()
    initial.suppliers.push({ id: 'supplier-1' } as never)
    await gateway.write(initial)
    storage.failWrites = true
    const candidate = createEmptyLocalState()
    candidate.suppliers.push({ id: 'supplier-2' } as never)

    await expect(gateway.write(candidate)).rejects.toThrow('storage unavailable')

    expect(gateway.read().suppliers).toEqual([{ id: 'supplier-1' }])
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
})
