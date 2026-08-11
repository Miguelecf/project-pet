import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { CategoryRepository } from '../modules/categories/CategoryRepository'
import type { DailyIncomeRepository } from '../modules/daily-income/DailyIncomeRepository'
import type { InvoiceRepository } from '../modules/invoices/InvoiceRepository'
import type { PaymentRepository } from '../modules/invoices/PaymentRepository'
import type { SettingsRepository } from '../modules/settings/SettingsRepository'
import type { SupplierRepository } from '../modules/suppliers/SupplierRepository'
import { LocalCategoryRepository } from '../infrastructure/local/LocalCategoryRepository'
import { LocalDailyIncomeRepository } from '../infrastructure/local/LocalDailyIncomeRepository'
import { LocalInvoiceRepository } from '../infrastructure/local/LocalInvoiceRepository'
import { LocalPaymentRepository } from '../infrastructure/local/LocalPaymentRepository'
import { LocalSettingsRepository } from '../infrastructure/local/LocalSettingsRepository'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { LocalSupplierRepository } from '../infrastructure/local/LocalSupplierRepository'
import { RepositoryContext } from './RepositoryContext'

export interface Repositories {
  readonly suppliers: SupplierRepository
  readonly categories: CategoryRepository
  readonly settings: SettingsRepository
  readonly invoices: InvoiceRepository
  readonly payments: PaymentRepository
  readonly dailyIncomes: DailyIncomeRepository
}

export interface RepositoryProviderValue {
  readonly repositories: Repositories
  readonly revision: number
  restore(): Promise<void>
}

interface RepositoryProviderProps {
  readonly children: ReactNode
  readonly gateway?: LocalStateGateway
  readonly repositories?: Repositories
}

const mutationMethods = new Set(['create', 'update', 'softDelete', 'delete', 'save', 'register', 'void', 'restore'])

function createLocalRepositories(gateway: LocalStateGateway): Repositories {
  return {
    suppliers: new LocalSupplierRepository(gateway),
    categories: new LocalCategoryRepository(gateway),
    settings: new LocalSettingsRepository(gateway),
    invoices: new LocalInvoiceRepository(gateway),
    payments: new LocalPaymentRepository(gateway),
    dailyIncomes: new LocalDailyIncomeRepository(gateway),
  }
}

function withRevision<T extends object>(repository: T, onMutation: () => void): T {
  return new Proxy(repository, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof property !== 'string' || !mutationMethods.has(property) || typeof value !== 'function') return value
      return async (...args: unknown[]) => {
        const result = await value.apply(target, args)
        onMutation()
        return result
      }
    },
  })
}

export function RepositoryProvider({ children, gateway: suppliedGateway, repositories: suppliedRepositories }: RepositoryProviderProps) {
  const [revision, setRevision] = useState(0)
  const gateway = useMemo(() => suppliedGateway ?? new LocalStateGateway(window.localStorage), [suppliedGateway])
  const incrementRevision = useCallback(() => setRevision((current) => current + 1), [])
  const repositories = useMemo(() => {
    if (suppliedRepositories) return suppliedRepositories
    const local = createLocalRepositories(gateway)
    return Object.fromEntries(Object.entries(local).map(([key, repository]) => [key, withRevision(repository, incrementRevision)])) as Repositories
  }, [gateway, incrementRevision, suppliedRepositories])
  const restore = useCallback(async () => {
    await gateway.restore()
    incrementRevision()
  }, [gateway, incrementRevision])
  const value = useMemo(() => ({ repositories, revision, restore }), [repositories, restore, revision])

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>
}
