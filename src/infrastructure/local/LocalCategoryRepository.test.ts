import { describeCategoryRepositoryContract } from '../../test/contracts/categoryRepositoryContract'
import { LocalCategoryRepository } from './LocalCategoryRepository'
import { LocalStateGateway } from './LocalStateGateway'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeCategoryRepositoryContract(() => {
  const gateway = new LocalStateGateway(new MemoryStorage())
  return {
    repository: new LocalCategoryRepository(gateway, { now: fixedNow, nextId: () => 'category-1' as never }),
    async createInvoiceLineReference(categoryId) {
      const state = gateway.read()
      state.invoiceLines.push({ id: 'line-1', categoryId } as never)
      await gateway.write(state)
    },
  }
})
