import { describeSupplierRepositoryContract } from '../../test/contracts/supplierRepositoryContract'
import { LocalStateGateway } from './LocalStateGateway'
import { LocalSupplierRepository } from './LocalSupplierRepository'
import { fixedNow, MemoryStorage } from './LocalRepositoryTestFixtures'

describeSupplierRepositoryContract(() => new LocalSupplierRepository(
  new LocalStateGateway(new MemoryStorage()),
  { now: fixedNow, nextId: () => 'supplier-1' as never },
))
