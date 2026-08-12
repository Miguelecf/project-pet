// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import type { DailyIncome } from '../../types/domain'
import { DailyIncomeForm } from './DailyIncomeForm'

const income = { id: 'income-1', saleDate: '2026-08-09', amountMinor: 500, currency: 'USD', note: 'Original', createdAt: '2026-08-09T00:00:00.000Z', updatedAt: '2026-08-09T00:00:00.000Z' } as unknown as DailyIncome

function renderForm({ create = vi.fn(async () => income), update = vi.fn(async () => income), existing }: { create?: ReturnType<typeof vi.fn>; update?: ReturnType<typeof vi.fn>; existing?: DailyIncome } = {}) {
  render(<MemoryRouter><RepositoryProvider repositories={{ settings: { get: async () => ({ currency: 'USD' }) }, dailyIncomes: { findAll: async () => [], create, update } } as never}><DailyIncomeForm clock={{ today: () => '2026-08-10' as never }} income={existing} /></RepositoryProvider></MemoryRouter>)
  return { create, update }
}

describe('DailyIncomeForm', () => {
  afterEach(cleanup)

  it('creates a valid positive integer income with optional trimmed note and current currency disclosure', async () => {
    const { create } = renderForm()
    await screen.findByText('Currency snapshot: USD')
    fireEvent.change(screen.getByLabelText('Sale date'), { target: { value: '2026-08-10' } })
    fireEvent.change(screen.getByLabelText('Amount (minor units)'), { target: { value: '25000' } })
    fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: '  Counter sale  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save daily income' }))
    await waitFor(() => expect(create).toHaveBeenCalledWith({ saleDate: '2026-08-10', amountMinor: 25000, note: 'Counter sale' }))
  })

  it('rejects zero, future, and duplicate dates before persistence', async () => {
    const create = vi.fn(async () => { throw new Error('duplicate sale date') })
    renderForm({ create })
    await screen.findByText('Currency snapshot: USD')
    fireEvent.change(screen.getByLabelText('Sale date'), { target: { value: '2026-08-10' } })
    fireEvent.change(screen.getByLabelText('Amount (minor units)'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save daily income' }))
    expect(screen.getByRole('alert').textContent).toBe('Daily income amount must be a positive safe integer')
    fireEvent.change(screen.getByLabelText('Amount (minor units)'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Sale date'), { target: { value: '2026-08-11' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save daily income' }))
    expect(screen.getByRole('alert').textContent).toBe('Date must not be in the future')
    fireEvent.change(screen.getByLabelText('Sale date'), { target: { value: '2026-08-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save daily income' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('duplicate sale date'))
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('edits without changing the historical currency snapshot', async () => {
    const { update } = renderForm({ existing: income })
    await screen.findByText('Currency snapshot: USD')
    fireEvent.change(screen.getByLabelText('Amount (minor units)'), { target: { value: '700' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save daily income' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith('income-1', { saleDate: '2026-08-09', amountMinor: 700, note: 'Original' }))
  })
})
