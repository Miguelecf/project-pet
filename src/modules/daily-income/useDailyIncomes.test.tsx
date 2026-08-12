// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../../app/RepositoryProvider'
import type { DailyIncome } from '../../types/domain'
import { useDailyIncomes } from './useDailyIncomes'

const income = { id: 'income-1', saleDate: '2026-08-10', amountMinor: 25000, currency: 'ARS', note: 'Cash sale', createdAt: '2026-08-10T00:00:00.000Z', updatedAt: '2026-08-10T00:00:00.000Z' } as unknown as DailyIncome

function IncomeState() {
  const { create, error, incomes, loading, refresh, remove, update } = useDailyIncomes()
  return <>
    <p>{loading ? 'loading incomes' : error ?? incomes.map((item) => `${item.id}:${item.amountMinor}`).join(',')}</p>
    <button onClick={() => void refresh()} type="button">Retry income load</button>
    <button onClick={() => void create({ saleDate: '2026-08-10' as never, amountMinor: 25000 as never, note: 'Cash sale' })} type="button">Create income</button>
    <button onClick={() => void update('income-1' as never, { saleDate: '2026-08-09' as never, amountMinor: 30000 as never, note: null })} type="button">Update income</button>
    <button onClick={() => void remove('income-1' as never)} type="button">Delete income</button>
  </>
}

describe('useDailyIncomes', () => {
  afterEach(cleanup)

  it('loads incomes and delegates create, update, and delete mutations', async () => {
    const findAll = vi.fn(async () => [income])
    const create = vi.fn(async () => income)
    const update = vi.fn(async () => ({ ...income, amountMinor: 30000 }))
    const remove = vi.fn(async () => undefined)
    render(<RepositoryProvider repositories={{ dailyIncomes: { findAll, create, update, delete: remove } } as never}><IncomeState /></RepositoryProvider>)

    await screen.findByText('income-1:25000')
    fireEvent.click(screen.getByRole('button', { name: 'Create income' }))
    fireEvent.click(screen.getByRole('button', { name: 'Update income' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete income' }))
    await waitFor(() => expect(create).toHaveBeenCalledWith({ saleDate: '2026-08-10', amountMinor: 25000, note: 'Cash sale' }))
    expect(update).toHaveBeenCalledWith('income-1', { saleDate: '2026-08-09', amountMinor: 30000, note: null })
    expect(remove).toHaveBeenCalledWith('income-1')
  })

  it('exposes a retriable load failure and refetches after a provider revision', async () => {
    const findAll = vi.fn().mockRejectedValueOnce(new Error('Income storage unavailable')).mockResolvedValueOnce([income]).mockResolvedValueOnce([{ ...income, id: 'income-2' }])
    render(<RepositoryProvider repositories={{ dailyIncomes: { findAll } } as never}><IncomeState /></RepositoryProvider>)

    await screen.findByText('Income storage unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Retry income load' }))
    await screen.findByText('income-1:25000')
  })
})
