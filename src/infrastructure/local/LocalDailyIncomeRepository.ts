import type { DailyIncome, DailyIncomeId, ISODateTime } from '../../types/domain'
import type { CreateDailyIncomeInput, DailyIncomeRepository, UpdateDailyIncomeInput } from '../../modules/daily-income/DailyIncomeRepository'
import { LocalStateGateway } from './LocalStateGateway'

interface LocalDailyIncomeRepositoryOptions {
  readonly now?: () => ISODateTime
  readonly nextId?: () => DailyIncomeId
}

export class LocalDailyIncomeRepository implements DailyIncomeRepository {
  private readonly gateway: LocalStateGateway
  private readonly now: () => ISODateTime
  private readonly nextId: () => DailyIncomeId

  constructor(gateway: LocalStateGateway, options: LocalDailyIncomeRepositoryOptions = {}) {
    this.gateway = gateway
    this.now = options.now ?? (() => new Date().toISOString() as ISODateTime)
    this.nextId = options.nextId ?? (() => crypto.randomUUID() as DailyIncomeId)
  }

  async findAll(): Promise<readonly DailyIncome[]> { return [...this.gateway.read().dailyIncomes].sort((a, b) => b.saleDate.localeCompare(a.saleDate)) }
  async findById(id: DailyIncomeId): Promise<DailyIncome | null> { return this.gateway.read().dailyIncomes.find((income) => income.id === id) ?? null }
  async create(input: CreateDailyIncomeInput): Promise<DailyIncome> {
    const state = this.gateway.read()
    this.ensureUnique(state.dailyIncomes, input.saleDate)
    const timestamp = this.now()
    const income: DailyIncome = { id: this.nextId(), ...input, currency: state.settings?.currency ?? 'ARS', createdAt: timestamp, updatedAt: timestamp }
    state.dailyIncomes.push(income)
    await this.gateway.write(state)
    return income
  }
  async update(id: DailyIncomeId, input: UpdateDailyIncomeInput): Promise<DailyIncome> {
    const state = this.gateway.read()
    const index = state.dailyIncomes.findIndex((income) => income.id === id)
    if (index < 0) throw new Error('daily income not found')
    this.ensureUnique(state.dailyIncomes, input.saleDate, id)
    const income: DailyIncome = { ...state.dailyIncomes[index], ...input, updatedAt: this.now() }
    state.dailyIncomes[index] = income
    await this.gateway.write(state)
    return income
  }
  async delete(id: DailyIncomeId): Promise<void> {
    const state = this.gateway.read()
    const index = state.dailyIncomes.findIndex((income) => income.id === id)
    if (index < 0) throw new Error('daily income not found')
    state.dailyIncomes.splice(index, 1)
    await this.gateway.write(state)
  }

  private ensureUnique(incomes: readonly DailyIncome[], saleDate: string, ownId?: DailyIncomeId): void {
    if (incomes.some((income) => income.id !== ownId && income.saleDate === saleDate)) throw new Error('duplicate sale date')
  }
}
