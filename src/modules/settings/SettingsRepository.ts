import type { Currency, NonNegativeInteger, Settings } from '../../types/domain'

export interface SaveSettingsInput {
  readonly currency: Currency
  readonly dueAlertDays: NonNegativeInteger
}

export interface SettingsRepository {
  get(): Promise<Settings>
  save(input: SaveSettingsInput): Promise<Settings>
}
