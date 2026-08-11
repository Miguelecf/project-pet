import { describeCategoryRepositoryContract } from './categoryRepositoryContract'
import { describeDailyIncomeRepositoryContract } from './dailyIncomeRepositoryContract'
import { describeInvoiceRepositoryContract } from './invoiceRepositoryContract'
import { describePaymentRepositoryContract } from './paymentRepositoryContract'
import { describeSettingsRepositoryContract } from './settingsRepositoryContract'
import { describeSupplierRepositoryContract } from './supplierRepositoryContract'
import { createInMemoryContractFixtures } from './inMemoryContractFixtures'

const fixtures = () => createInMemoryContractFixtures()

describeSupplierRepositoryContract(() => fixtures().suppliers)
describeCategoryRepositoryContract(() => fixtures().categories)
describeSettingsRepositoryContract(() => fixtures().settings)
describeInvoiceRepositoryContract(() => fixtures().invoices)
describePaymentRepositoryContract(() => fixtures().payments)
describeDailyIncomeRepositoryContract(() => fixtures().dailyIncome)
