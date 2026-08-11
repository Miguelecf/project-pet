import type { ISODate } from '../types/domain'

export interface Clock {
  today(): ISODate
}

export type DateKind = 'issue' | 'payment' | 'sale' | 'due'

export function validateISODate(value: string, clock: Clock, options: { readonly kind?: DateKind } = {}): ISODate {
  if (!isISOCalendarDate(value)) {
    throw new RangeError('Date must be a valid ISO YYYY-MM-DD calendar date')
  }
  if (options.kind !== 'due' && isFuture(value, clock)) {
    throw new RangeError('Date must not be in the future')
  }

  return value as ISODate
}

export function isFuture(value: string, clock: Clock): boolean {
  if (!isISOCalendarDate(value)) {
    throw new RangeError('Date must be a valid ISO YYYY-MM-DD calendar date')
  }
  const today = clock.today()
  if (!isISOCalendarDate(today)) {
    throw new RangeError('Clock must return a valid ISO YYYY-MM-DD calendar date')
  }

  return value > today
}

function isISOCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match === null) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year === 0 || month < 1 || month > 12 || day < 1) {
    return false
  }

  const daysInMonth = month === 2
    ? (isLeapYear(year) ? 29 : 28)
    : [4, 6, 9, 11].includes(month) ? 30 : 31
  return day <= daysInMonth
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}
