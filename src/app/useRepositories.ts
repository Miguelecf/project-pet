import { useContext } from 'react'
import type { RepositoryProviderValue } from './RepositoryProvider'
import { RepositoryContext } from './RepositoryContext'

export function useRepositories(): RepositoryProviderValue {
  const value = useContext(RepositoryContext)
  if (!value) throw new Error('useRepositories must be used within RepositoryProvider')
  return value
}
