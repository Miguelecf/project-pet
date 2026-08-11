import type { ISODateTime } from '../../types/domain'

export const fixedNow = (): ISODateTime => '2026-08-10T00:00:00.000Z' as ISODateTime

export class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}
