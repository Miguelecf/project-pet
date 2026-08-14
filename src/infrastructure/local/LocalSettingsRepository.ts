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
    if (input.currency !== 'ARS' && input.currency !== 'USD') throw new Error('Currency must be ARS or USD')
    if (!Number.isInteger(input.dueAlertDays) || input.dueAlertDays < 0) throw new Error('Due alert days must be a non-negative whole number')
    const mismatchedInvoices = state.invoices.filter((invoice) => invoice.currency !== input.currency)
    const mismatchedIncomes = state.dailyIncomes.filter((income) => income.currency !== input.currency)
    if (mismatchedInvoices.length || mismatchedIncomes.length) {
      const currency = mismatchedInvoices[0]?.currency ?? mismatchedIncomes[0]?.currency
      const recordTypes = [
        mismatchedInvoices.length > 0 && `${mismatchedInvoices.length} invoice(s) exist with ${currency}`,
        mismatchedIncomes.length > 0 && `${mismatchedIncomes.length} daily income(s) exist with ${currency}`,
      ].filter(Boolean).join(' and ')
      throw new Error(`Cannot change currency: ${recordTypes}`)
    }
    const previous = state.settings ?? this.defaults()
    const settings: Settings = { ...previous, ...input, updatedAt: this.now() }
    state.settings = settings
    await this.gateway.write(state)
    return settings
  }

  private defaults(): Settings {
    const timestamp = this.now()
    return { currency: 'ARS', dueAlertDays: 7 as never, createdAt: timestamp, updatedAt: timestamp }
  }
}
