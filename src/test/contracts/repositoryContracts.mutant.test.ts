import { describeCategoryRepositoryContract } from './categoryRepositoryContract'
import { describeDailyIncomeRepositoryContract } from './dailyIncomeRepositoryContract'
import { createInMemoryContractFixtures, type ContractMutant } from './inMemoryContractFixtures'
import { describePaymentRepositoryContract } from './paymentRepositoryContract'
import { describe, it } from 'vitest'

const mutant = process.env.CONTRACT_MUTANT as ContractMutant | undefined

const fixtures = () => createInMemoryContractFixtures({ mutant })

if (!mutant) {
  describe('repository contract mutation runner', () => {
    it.skip('runs only when the conformance harness selects a mutation', () => {})
  })
} else {
  if (mutant === 'category-delete-retained') describeCategoryRepositoryContract(() => fixtures().categories)
  if (mutant === 'daily-income-delete-retained') describeDailyIncomeRepositoryContract(() => fixtures().dailyIncome)
  if (mutant === 'payment-balance-untracked' || mutant === 'payment-void-unpersisted') describePaymentRepositoryContract(() => fixtures().payments)
}
