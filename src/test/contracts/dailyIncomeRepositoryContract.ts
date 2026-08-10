import { describe, expect, it } from 'vitest'
import type { DailyIncomeRepository } from '../../modules/daily-income/DailyIncomeRepository'

export function describeDailyIncomeRepositoryContract(createRepository: () => DailyIncomeRepository): void {
  describe('DailyIncomeRepository contract', () => {
    it('creates, reads, updates, and deletes daily income', async () => {
      const repository = createRepository()
      const created = await repository.create({ saleDate: '2026-08-10' as never, amountMinor: 1000 as never, note: 'Demo income' })

      expect(created).toMatchObject({ amountMinor: 1000, note: 'Demo income' })
      expect(await repository.findById(created.id)).toEqual(created)
      expect(await repository.update(created.id, { saleDate: '2026-08-09' as never, amountMinor: 2000 as never, note: null })).toMatchObject({ amountMinor: 2000, note: null })

      await repository.delete(created.id)
      expect(await repository.findAll()).not.toContainEqual(expect.objectContaining({ id: created.id }))
    })

    it('rejects a duplicate sale date', async () => {
      const repository = createRepository()
      await repository.create({ saleDate: '2026-08-10' as never, amountMinor: 1000 as never, note: null })
      await expect(repository.create({ saleDate: '2026-08-10' as never, amountMinor: 2000 as never, note: null })).rejects.toThrow()
    })
  })
}
