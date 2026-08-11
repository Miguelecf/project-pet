import { useCallback, useEffect, useState } from 'react'
import { useRepositories } from '../../app/useRepositories'
import type { Settings } from '../../types/domain'
import type { SaveSettingsInput } from './SettingsRepository'

export function useSettings() {
  const { repositories, revision } = useRepositories()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSettings(await repositories.settings.get())
    } catch (reason) {
      setSettings(null)
      setError(reason instanceof Error ? reason.message : 'Could not load settings')
    } finally {
      setLoading(false)
    }
  }, [repositories])

  useEffect(() => { void refresh() }, [refresh, revision])

  const save = useCallback(async (input: SaveSettingsInput) => {
    try {
      const saved = await repositories.settings.save(input)
      setSettings(saved)
      setError(null)
      return saved
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Could not save settings'
      setError(message)
      throw reason
    }
  }, [repositories])

  return { settings, loading, error, refresh, save }
}
