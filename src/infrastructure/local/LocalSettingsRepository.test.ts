import { describeSettingsRepositoryContract } from '../../test/contracts/settingsRepositoryContract'
import { LocalStateGateway } from './LocalStateGateway'
import { LocalSettingsRepository } from './LocalSettingsRepository'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeSettingsRepositoryContract(() => {
  const gateway = new LocalStateGateway(new MemoryStorage())
  return {
    repository: new LocalSettingsRepository(gateway, { now: fixedNow }),
    async recordInvoice() {
      const state = gateway.read()
      state.invoices.push({ id: 'invoice-1', currency: 'USD' } as never)
      await gateway.write(state)
    },
    async recordDailyIncome() {
      const state = gateway.read()
      state.dailyIncomes.push({ id: 'income-1', currency: 'ARS' } as never)
      await gateway.write(state)
    },
  }
})
