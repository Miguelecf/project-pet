import { describe, expect, it } from 'vitest'
import type { SettingsRepository } from '../../modules/settings/SettingsRepository'

export interface SettingsContractFixture {
  readonly repository: SettingsRepository
  recordInvoice(): Promise<void>
  recordDailyIncome(): Promise<void>
}

export function describeSettingsRepositoryContract(createFixture: () => SettingsContractFixture): void {
  describe('SettingsRepository contract', () => {
    it('returns defaults and saves singleton settings', async () => {
      const { repository } = createFixture()
      const defaults = await repository.get()

      expect(defaults).toEqual({
        currency: 'USD',
        dueAlertDays: 7,
        createdAt: '2026-08-10T00:00:00.000Z',
        updatedAt: '2026-08-10T00:00:00.000Z',
      })
      const saved = await repository.save({ currency: 'ARS', dueAlertDays: 10 as never })
      expect(saved).toMatchObject({ currency: 'ARS', dueAlertDays: 10 })
      expect(await repository.get()).toEqual(saved)
    })

    it('locks valid ARS and USD changes after financial activity', async () => {
      const usdFixture = createFixture()
      await usdFixture.recordInvoice()
      await expect(usdFixture.repository.save({ currency: 'ARS', dueAlertDays: 0 as never })).rejects.toThrow()

      const arsFixture = createFixture()
      await arsFixture.repository.save({ currency: 'ARS', dueAlertDays: 0 as never })
      await arsFixture.recordDailyIncome()
      await expect(arsFixture.repository.save({ currency: 'USD', dueAlertDays: 0 as never })).rejects.toThrow()
    })
  })
}
