import type { Category, CategoryId, ISODateTime } from '../../types/domain'
import type { CategoryRepository, CreateCategoryInput, UpdateCategoryInput } from '../../modules/categories/CategoryRepository'
import { LocalStateGateway } from './LocalStateGateway'

interface LocalCategoryRepositoryOptions {
  readonly now?: () => ISODateTime
  readonly nextId?: () => CategoryId
}

export class LocalCategoryRepository implements CategoryRepository {
  private readonly now: () => ISODateTime
  private readonly nextId: () => CategoryId
  private readonly gateway: LocalStateGateway

  constructor(gateway: LocalStateGateway, options: LocalCategoryRepositoryOptions = {}) {
    this.gateway = gateway
    this.now = options.now ?? (() => new Date().toISOString() as ISODateTime)
    this.nextId = options.nextId ?? (() => crypto.randomUUID() as CategoryId)
  }

  async findAll(): Promise<readonly Category[]> { return this.gateway.read().categories }
  async findById(id: CategoryId): Promise<Category | null> { return this.gateway.read().categories.find((category) => category.id === id) ?? null }

  async create(input: CreateCategoryInput): Promise<Category> {
    const { name, normalizedName } = normalizeName(input.name)
    const state = this.gateway.read()
    this.ensureUnique(state.categories, normalizedName)
    const timestamp = this.now()
    const category: Category = { id: this.nextId(), name, normalizedName, createdAt: timestamp, updatedAt: timestamp }
    state.categories.push(category)
    await this.gateway.write(state)
    return category
  }

  async update(id: CategoryId, input: UpdateCategoryInput): Promise<Category> {
    const state = this.gateway.read()
    const index = state.categories.findIndex((category) => category.id === id)
    if (index < 0) throw new Error('category not found')
    const { name, normalizedName } = normalizeName(input.name)
    this.ensureUnique(state.categories, normalizedName, id)
    const category: Category = { ...state.categories[index], name, normalizedName, updatedAt: this.now() }
    state.categories[index] = category
    await this.gateway.write(state)
    return category
  }

  async delete(id: CategoryId): Promise<void> {
    const state = this.gateway.read()
    const references = state.invoiceLines.filter((line) => line.categoryId === id).length
    if (references > 0) throw new Error(`category is referenced: Cannot delete: referenced by ${references} invoice line(s)`)
    const index = state.categories.findIndex((category) => category.id === id)
    if (index < 0) throw new Error('category not found')
    state.categories.splice(index, 1)
    await this.gateway.write(state)
  }

  async isReferenced(id: CategoryId): Promise<number> {
    return this.gateway.read().invoiceLines.filter((line) => line.categoryId === id).length
  }

  private ensureUnique(categories: readonly Category[], normalizedName: string, ownId?: CategoryId): void {
    if (categories.some((category) => category.id !== ownId && category.normalizedName === normalizedName)) throw new Error('duplicate category name')
  }
}

function normalizeName(value: string): { readonly name: string; readonly normalizedName: string } {
  const name = value.trim()
  if (!name) throw new Error('category name is required')
  return { name, normalizedName: name.toLowerCase() }
}
