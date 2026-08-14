import { useState } from 'react'
import type { Currency, Settings } from '../../types/domain'
import type { SaveSettingsInput } from './SettingsRepository'

interface SettingsFormProps {
  readonly settings: Settings
  onSave(input: SaveSettingsInput): Promise<void>
}

export function SettingsForm({ onSave, settings }: SettingsFormProps) {
  const [currency, setCurrency] = useState<Currency>(settings.currency)
  const [dueAlertDays, setDueAlertDays] = useState(String(settings.dueAlertDays))
  const [error, setError] = useState<string | null>(null)

  async function save() {
    const parsedDueAlertDays = Number(dueAlertDays)
    if (!Number.isInteger(parsedDueAlertDays) || parsedDueAlertDays < 0) {
      setError('Los días de aviso de vencimiento deben ser un número entero igual o mayor a cero')
      return
    }
    setError(null)
    try {
      await onSave({ currency, dueAlertDays: parsedDueAlertDays as never })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar la configuración')
    }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void save() }}>
      {error && <p role="alert">{error}</p>}
      <label htmlFor="settings-currency">Moneda</label>
      <select id="settings-currency" name="currency" onChange={(event) => setCurrency(event.target.value as Currency)} value={currency}>
        <option value="USD">USD</option>
        <option value="ARS">ARS</option>
      </select>
      <label htmlFor="settings-due-alert-days">Días de aviso de vencimiento</label>
      <input id="settings-due-alert-days" name="due-alert-days" onChange={(event) => setDueAlertDays(event.target.value)} type="number" value={dueAlertDays} />
      <button type="submit">Guardar</button>
    </form>
  )
}
