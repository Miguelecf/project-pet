import { describe, expect, it } from 'vitest'
import type { SettingsRepository } from '../../modules/settings/SettingsRepository'

export function describeSettingsRepositoryContract(createRepository: () => SettingsRepository): void {
  describe('SettingsRepository contract', () => {
    it('returns defaults and saves singleton settings', async () => {
      const repository = createRepository()
      const defaults = await repository.get()

      expect(defaults).toMatchObject({ currency: 'USD' })
      const saved = await repository.save({ currency: 'ARS', dueAlertDays: 10 as never })
      expect(saved).toMatchObject({ currency: 'ARS', dueAlertDays: 10 })
      expect(await repository.get()).toEqual(saved)
    })

    it('propagates a rejected currency-lock save', async () => {
      const repository = createRepository()
      await expect(repository.save({ currency: 'INVALID' as never, dueAlertDays: 0 as never })).rejects.toThrow()
    })
  })
}
