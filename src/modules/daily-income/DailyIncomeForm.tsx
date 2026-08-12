import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DailyIncome } from '../../types/domain'
import { validateISODate, type Clock } from '../../utils/dates'
import { useSettings } from '../settings/useSettings'
import { useDailyIncomes } from './useDailyIncomes'

interface DailyIncomeFormProps {
  readonly clock?: Clock
  readonly income?: DailyIncome
}

function systemClock(): Clock {
  return { today: () => new Date().toISOString().slice(0, 10) as never }
}

function validatePositiveMoney(value: string): number {
  const amount = Number(value)
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('Daily income amount must be a positive safe integer')
  return amount
}

export function DailyIncomeForm({ clock = systemClock(), income }: DailyIncomeFormProps) {
  const navigate = useNavigate()
  const { create, update } = useDailyIncomes()
  const { settings } = useSettings()
  const [saleDate, setSaleDate] = useState(income?.saleDate ?? '')
  const [amount, setAmount] = useState(income?.amountMinor.toString() ?? '')
  const [note, setNote] = useState(income?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    try {
      const input = {
        saleDate: validateISODate(saleDate, clock, { kind: 'sale' }),
        amountMinor: validatePositiveMoney(amount) as never,
        note: note.trim() || null,
      }
      if (income) await update(income.id, input)
      else await create(input)
      navigate('/daily-income')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save daily income')
    }
  }

  return <section aria-labelledby="daily-income-form-title">
    <p className="eyebrow">Operations</p>
    <h1 id="daily-income-form-title">{income ? 'Edit daily income' : 'Create daily income'}</h1>
    {settings && <p>Currency snapshot: {income?.currency ?? settings.currency}</p>}
    {error && <p role="alert">{error}</p>}
    <label htmlFor="sale-date">Sale date</label>
    <input id="sale-date" name="sale-date" onChange={(event) => setSaleDate(event.target.value)} type="date" value={saleDate} />
    <label htmlFor="daily-income-amount">Amount (minor units)</label>
    <input id="daily-income-amount" inputMode="numeric" name="daily-income-amount" onChange={(event) => setAmount(event.target.value)} value={amount} />
    <label htmlFor="daily-income-note">Note (optional)</label>
    <textarea id="daily-income-note" name="daily-income-note" onChange={(event) => setNote(event.target.value)} value={note} />
    <div>
      <button onClick={() => void save()} type="button">Save daily income</button>
      <button onClick={() => navigate('/daily-income')} type="button">Cancel</button>
    </div>
  </section>
}
