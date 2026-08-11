import { createContext } from 'react'
import type { RepositoryProviderValue } from './RepositoryProvider'

export const RepositoryContext = createContext<RepositoryProviderValue | null>(null)
