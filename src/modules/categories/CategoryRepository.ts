import type { Category, CategoryId } from '../../types/domain'

export interface CreateCategoryInput {
  readonly name: string
}

export interface UpdateCategoryInput extends CreateCategoryInput {}

export interface CategoryRepository {
  findAll(): Promise<readonly Category[]>
  findById(id: CategoryId): Promise<Category | null>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: CategoryId, input: UpdateCategoryInput): Promise<Category>
  delete(id: CategoryId): Promise<void>
  isReferenced(id: CategoryId): Promise<number>
}
