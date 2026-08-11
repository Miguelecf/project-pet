import type { ISODateTime, Supplier, SupplierId } from '../../types/domain'
import type { CreateSupplierInput, SupplierRepository, UpdateSupplierInput } from '../../modules/suppliers/SupplierRepository'
import { LocalStateGateway } from './LocalStateGateway'

interface LocalSupplierRepositoryOptions {
  readonly now?: () => ISODateTime
  readonly nextId?: () => SupplierId
}

export class LocalSupplierRepository implements SupplierRepository {
  private readonly now: () => ISODateTime
  private readonly nextId: () => SupplierId
  private readonly gateway: LocalStateGateway

  constructor(gateway: LocalStateGateway, options: LocalSupplierRepositoryOptions = {}) {
    this.gateway = gateway
    this.now = options.now ?? (() => new Date().toISOString() as ISODateTime)
    this.nextId = options.nextId ?? (() => crypto.randomUUID() as SupplierId)
  }

  async findAll(): Promise<readonly Supplier[]> {
    return this.gateway.read().suppliers.filter((supplier) => supplier.deletedAt === null)
  }

  async findById(id: SupplierId): Promise<Supplier | null> {
    return this.gateway.read().suppliers.find((supplier) => supplier.id === id) ?? null
  }

  async create(input: CreateSupplierInput): Promise<Supplier> {
    const { name, normalizedName } = normalizeName(input.name)
    const state = this.gateway.read()
    this.ensureUnique(state.suppliers, normalizedName)
    const timestamp = this.now()
    const supplier: Supplier = { id: this.nextId(), name, normalizedName, defaultDueDays: input.defaultDueDays, deletedAt: null, createdAt: timestamp, updatedAt: timestamp }
    state.suppliers.push(supplier)
    await this.gateway.write(state)
    return supplier
  }

  async update(id: SupplierId, input: UpdateSupplierInput): Promise<Supplier> {
    const state = this.gateway.read()
    const index = state.suppliers.findIndex((supplier) => supplier.id === id)
    if (index < 0) throw new Error('supplier not found')
    const previous = state.suppliers[index]
    const { name, normalizedName } = input.name === undefined ? previous : normalizeName(input.name)
    this.ensureUnique(state.suppliers, normalizedName, id)
    const supplier: Supplier = {
      ...previous,
      name,
      normalizedName,
      defaultDueDays: 'defaultDueDays' in input ? input.defaultDueDays ?? null : previous.defaultDueDays,
      updatedAt: this.now(),
    }
    state.suppliers[index] = supplier
    await this.gateway.write(state)
    return supplier
  }

  async softDelete(id: SupplierId): Promise<void> {
    const state = this.gateway.read()
    const index = state.suppliers.findIndex((supplier) => supplier.id === id)
    if (index < 0) throw new Error('supplier not found')
    state.suppliers[index] = { ...state.suppliers[index], deletedAt: this.now(), updatedAt: this.now() }
    await this.gateway.write(state)
  }

  private ensureUnique(suppliers: readonly Supplier[], normalizedName: string, ownId?: SupplierId): void {
    if (suppliers.some((supplier) => supplier.id !== ownId && supplier.deletedAt === null && supplier.normalizedName === normalizedName)) {
      throw new Error('duplicate supplier name')
    }
  }
}

function normalizeName(value: string): { readonly name: string; readonly normalizedName: string } {
  const name = value.trim()
  if (!name) throw new Error('supplier name is required')
  return { name, normalizedName: name.toLowerCase() }
}
