import { useState } from 'react'
import { StateOverlay } from '../../components/StateOverlay'
import { SettingsForm } from './SettingsForm'
import { useSettings } from './useSettings'

export function SettingsPage() {
  const { error, loading, refresh, save, settings } = useSettings()
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  async function saveSettings(input: Parameters<typeof save>[0]) {
    await save(input)
    setSaveMessage('Settings saved.')
  }

  if (loading) return <StateOverlay state="loading"><section aria-label="Settings" /></StateOverlay>
  if (error && !settings) return <StateOverlay error={error} onRetry={() => void refresh()} state="error"><section aria-label="Settings" /></StateOverlay>
  if (!settings) return null

  return (
    <section aria-labelledby="settings-title" className="settings-page">
      <p className="eyebrow">Configuration</p>
      <h1 id="settings-title">Settings</h1>
      {saveMessage && <p role="status">{saveMessage}</p>}
      <SettingsForm onSave={saveSettings} settings={settings} />
    </section>
  )
}
