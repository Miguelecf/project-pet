// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Settings } from '../../types/domain'
import { SettingsForm } from './SettingsForm'

const settings = {
  currency: 'USD',
  dueAlertDays: 7,
  createdAt: '2026-08-10T00:00:00.000Z',
  updatedAt: '2026-08-10T00:00:00.000Z',
} as Settings

describe('SettingsForm', () => {
  afterEach(cleanup)

  it('validates a non-negative whole due-alert value before saving', async () => {
    const onSave = vi.fn(async () => undefined)
    render(<SettingsForm onSave={onSave} settings={settings} />)

    fireEvent.change(screen.getByLabelText('Due alert days'), { target: { value: '-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    expect((await screen.findByRole('alert')).textContent).toBe('Due alert days must be a non-negative whole number')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows a combined currency-lock error that references invoices and daily incomes', async () => {
    const onSave = vi.fn(async () => { throw new Error('Cannot change currency: 3 invoice(s) exist with USD and 2 daily income(s) exist with USD') })
    render(<SettingsForm onSave={onSave} settings={settings} />)

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ARS' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Cannot change currency: 3 invoice(s) exist with USD and 2 daily income(s) exist with USD'))
    expect(onSave).toHaveBeenCalledWith({ currency: 'ARS', dueAlertDays: 7 })
  })

  it('preserves an in-progress edit when a stale settings refresh re-renders the form', async () => {
    const onSave = vi.fn(async () => undefined)
    const { rerender } = render(<SettingsForm onSave={onSave} settings={settings} />)

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ARS' } })
    fireEvent.change(screen.getByLabelText('Due alert days'), { target: { value: '10' } })
    rerender(<SettingsForm onSave={onSave} settings={{ ...settings }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ currency: 'ARS', dueAlertDays: 10 }))
  })

  it('uses a fallback error when save rejects with a non-Error value', async () => {
    const onSave = vi.fn(async () => { throw 'offline' })
    render(<SettingsForm onSave={onSave} settings={settings} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Could not save settings'))
    expect(onSave).toHaveBeenCalledWith({ currency: 'USD', dueAlertDays: 7 })
  })
})
