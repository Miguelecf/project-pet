import { describe, expect, it } from 'vitest'
import type { CategoryRepository } from '../../modules/categories/CategoryRepository'

export interface CategoryContractFixture {
  readonly repository: CategoryRepository
  createInvoiceLineReference(categoryId: Parameters<CategoryRepository['isReferenced']>[0]): Promise<void>
}

export function describeCategoryRepositoryContract(createFixture: () => CategoryContractFixture): void {
  describe('CategoryRepository contract', () => {
    it('creates, reads, updates, and deletes unreferenced categories', async () => {
      const { repository } = createFixture()
      const created = await repository.create({ name: '  Demo Category A  ' })

      expect(created).toMatchObject({ name: 'Demo Category A', normalizedName: 'demo category a' })
      expect(await repository.findAll()).toContainEqual(expect.objectContaining({ id: created.id }))
      expect(await repository.findById(created.id)).toEqual(created)
      const updated = await repository.update(created.id, { name: 'Demo Category B' })
      expect(updated).toMatchObject({ name: 'Demo Category B' })
      expect(await repository.findAll()).toContainEqual(expect.objectContaining({ id: created.id, name: 'Demo Category B' }))

      expect(await repository.isReferenced(created.id)).toBe(0)
      await repository.delete(created.id)
      expect(await repository.findById(created.id)).toBeNull()
      expect(await repository.findAll()).not.toContainEqual(expect.objectContaining({ id: created.id }))
    })

    it('rejects duplicate names and deleting referenced categories', async () => {
      const { createInvoiceLineReference, repository } = createFixture()
      const created = await repository.create({ name: 'Demo Category A' })
      await expect(repository.create({ name: 'demo category a' })).rejects.toThrow()

      await createInvoiceLineReference(created.id)
      expect(await repository.isReferenced(created.id)).toBe(1)
      await expect(repository.delete(created.id)).rejects.toThrow('category is referenced')
    })
  })
}
