import type { DailyIncome, DailyIncomeId, ISODate, MoneyMinor } from '../../types/domain'

export interface CreateDailyIncomeInput {
  readonly saleDate: ISODate
  readonly amountMinor: MoneyMinor
  readonly note: string | null
}

export interface UpdateDailyIncomeInput extends CreateDailyIncomeInput {}

export interface DailyIncomeRepository {
  findAll(): Promise<readonly DailyIncome[]>
  findById(id: DailyIncomeId): Promise<DailyIncome | null>
  create(input: CreateDailyIncomeInput): Promise<DailyIncome>
  update(id: DailyIncomeId, input: UpdateDailyIncomeInput): Promise<DailyIncome>
  delete(id: DailyIncomeId): Promise<void>
}
