import { createEmptyLocalState, SCHEMA_VERSION, STORAGE_KEY, type LocalState } from './LocalStateSchema'

export type LocalStateRecovery = 'ready' | 'needs_seed' | 'unavailable'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const collectionKeys = ['suppliers', 'categories', 'invoices', 'invoiceLines', 'payments', 'dailyIncomes'] as const

export class LocalStateGateway {
  recovery: LocalStateRecovery = 'needs_seed'
  private readonly storage: StorageLike

  constructor(storage: StorageLike) {
    this.storage = storage
  }

  read(): LocalState {
    let raw: string | null
    try {
      raw = this.storage.getItem(STORAGE_KEY)
    } catch {
      this.recovery = 'unavailable'
      return createEmptyLocalState()
    }

    if (!raw) return this.recoverNeedsSeed()

    try {
      const parsed: unknown = JSON.parse(raw)
      if (!isLocalState(parsed)) return this.recoverNeedsSeed()

      this.recovery = 'ready'
      return cloneState(parsed)
    } catch {
      return this.recoverNeedsSeed()
    }
  }

  async write(candidate: LocalState): Promise<void> {
    const nextState = cloneAndValidate(candidate)
    const serialized = JSON.stringify(nextState)

    this.storage.setItem(STORAGE_KEY, serialized)
    this.recovery = 'ready'
  }

  private recoverNeedsSeed(): LocalState {
    this.recovery = 'needs_seed'
    return createEmptyLocalState()
  }
}

function cloneAndValidate(candidate: LocalState): LocalState {
  if (!isLocalState(candidate)) throw new Error('invalid local state envelope')
  return cloneState(candidate)
}

function cloneState(state: LocalState): LocalState {
  return JSON.parse(JSON.stringify(state)) as LocalState
}

function isLocalState(value: unknown): value is LocalState {
  if (!isRecord(value) || value.schemaVersion !== SCHEMA_VERSION || !(value.settings === null || isRecord(value.settings))) return false
  return collectionKeys.every((key) => Array.isArray(value[key]))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export { createEmptyLocalState, SCHEMA_VERSION, STORAGE_KEY }
export type { LocalState }
