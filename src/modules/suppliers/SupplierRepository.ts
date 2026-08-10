import type { PositiveInteger, Supplier, SupplierId } from '../../types/domain'

export interface CreateSupplierInput {
  readonly name: string
  readonly defaultDueDays: PositiveInteger | null
}

export interface UpdateSupplierInput {
  readonly name?: string
  readonly defaultDueDays?: PositiveInteger | null
}

export interface SupplierRepository {
  findAll(): Promise<readonly Supplier[]>
  findById(id: SupplierId): Promise<Supplier | null>
  create(input: CreateSupplierInput): Promise<Supplier>
  update(id: SupplierId, input: UpdateSupplierInput): Promise<Supplier>
  softDelete(id: SupplierId): Promise<void>
}
