import type { ISODateTime, Settings } from '../../types/domain'
import type { SaveSettingsInput, SettingsRepository } from '../../modules/settings/SettingsRepository'
import { LocalStateGateway } from './LocalStateGateway'

interface LocalSettingsRepositoryOptions {
  readonly now?: () => ISODateTime
}

export class LocalSettingsRepository implements SettingsRepository {
  private readonly now: () => ISODateTime
  private readonly gateway: LocalStateGateway

  constructor(gateway: LocalStateGateway, options: LocalSettingsRepositoryOptions = {}) {
    this.gateway = gateway
    this.now = options.now ?? (() => new Date().toISOString() as ISODateTime)
  }

  async get(): Promise<Settings> {
    const state = this.gateway.read()
    return state.settings ?? this.defaults()
  }

  async save(input: SaveSettingsInput): Promise<Settings> {
    const state = this.gateway.read()
    const mismatchedInvoices = state.invoices.filter((invoice) => invoice.currency !== input.currency)
    const mismatchedIncomes = state.dailyIncomes.filter((income) => income.currency !== input.currency)
    if (mismatchedInvoices.length || mismatchedIncomes.length) {
      throw new Error(`Cannot change currency: ${mismatchedInvoices.length} invoice(s) and ${mismatchedIncomes.length} daily income(s) use a different currency`)
    }
    const previous = state.settings ?? this.defaults()
    const settings: Settings = { ...previous, ...input, updatedAt: this.now() }
    state.settings = settings
    await this.gateway.write(state)
    return settings
  }

  private defaults(): Settings {
    const timestamp = this.now()
    return { currency: 'USD', dueAlertDays: 7 as never, createdAt: timestamp, updatedAt: timestamp }
  }
}
