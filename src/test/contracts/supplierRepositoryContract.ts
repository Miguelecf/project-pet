import { describe, expect, it } from 'vitest'
import type { SupplierRepository } from '../../modules/suppliers/SupplierRepository'

export function describeSupplierRepositoryContract(createRepository: () => SupplierRepository): void {
  describe('SupplierRepository contract', () => {
    it('creates, reads, updates, and soft-deletes suppliers', async () => {
      const repository = createRepository()
      const created = await repository.create({ name: '  Demo Supplier A  ', defaultDueDays: null })

      expect(created).toMatchObject({ name: 'Demo Supplier A', normalizedName: 'demo supplier a', deletedAt: null })
      expect(await repository.findById(created.id)).toEqual(created)

      const updated = await repository.update(created.id, { name: 'Demo Supplier B' })
      expect(updated).toMatchObject({ id: created.id, name: 'Demo Supplier B', normalizedName: 'demo supplier b' })

      await repository.softDelete(created.id)
      expect(await repository.findAll()).not.toContainEqual(expect.objectContaining({ id: created.id }))
      expect(await repository.findById(created.id)).toMatchObject({ id: created.id, deletedAt: expect.any(String) })
    })

    it('rejects duplicate normalized active names', async () => {
      const repository = createRepository()
      await repository.create({ name: 'Demo Supplier A', defaultDueDays: null })

      await expect(repository.create({ name: '  demo supplier a ', defaultDueDays: null })).rejects.toThrow()
    })
  })
}
