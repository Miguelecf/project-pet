// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import type { Settings } from '../../types/domain'
import { useSettings } from './useSettings'

const defaults = {
  currency: 'USD',
  dueAlertDays: 7,
  createdAt: '2026-08-10T00:00:00.000Z',
  updatedAt: '2026-08-10T00:00:00.000Z',
} as Settings

function SettingsConsumer() {
  const { error, loading, save, settings } = useSettings()
  return (
    <>
      <output aria-label="settings">{settings ? `${settings.currency}:${settings.dueAlertDays}` : 'none'}</output>
      <output aria-label="loading">{String(loading)}</output>
      {error && <p role="alert">{error}</p>}
      <button onClick={() => void save({ currency: 'ARS', dueAlertDays: 10 as never }).catch(() => undefined)} type="button">Save ARS</button>
    </>
  )
}

describe('useSettings', () => {
  afterEach(cleanup)

  it('loads complete defaults and saves a new currency through the settings repository', async () => {
    const save = vi.fn(async () => ({ ...defaults, currency: 'ARS' as const, dueAlertDays: 10 as never }))
    render(<RepositoryProvider repositories={{ settings: { get: async () => defaults, save } } as never}><SettingsConsumer /></RepositoryProvider>)

    await waitFor(() => expect(screen.getByRole('status', { name: 'settings' }).textContent).toBe('USD:7'))
    fireEvent.click(screen.getByRole('button', { name: 'Save ARS' }))

    await waitFor(() => expect(save).toHaveBeenCalledWith({ currency: 'ARS', dueAlertDays: 10 }))
    expect(screen.getByRole('status', { name: 'settings' }).textContent).toBe('ARS:10')
  })

  it('keeps the loaded settings when a currency lock rejects the save', async () => {
    const save = vi.fn(async () => { throw new Error('Cannot change currency: 3 invoice(s) exist with USD and 2 daily income(s) exist with USD') })
    render(<RepositoryProvider repositories={{ settings: { get: async () => defaults, save } } as never}><SettingsConsumer /></RepositoryProvider>)

    await screen.findByRole('status', { name: 'settings' })
    fireEvent.click(screen.getByRole('button', { name: 'Save ARS' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Cannot change currency: 3 invoice(s) exist with USD and 2 daily income(s) exist with USD'))
    expect(screen.getByRole('status', { name: 'settings' }).textContent).toBe('USD:7')
  })
})
