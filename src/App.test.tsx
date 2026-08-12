// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { RepositoryProvider } from './app/RepositoryProvider'
import App from './App'

function renderApp() {
  return render(<MemoryRouter><RepositoryProvider repositories={{
    invoices: { findAll: async () => [] },
    payments: { findByInvoice: async () => [] },
    dailyIncomes: { findAll: async () => [] },
    categories: { findAll: async () => [] },
    settings: { get: async () => ({ dueAlertDays: 7 }) },
  } as never}><App /></RepositoryProvider></MemoryRouter>)
}

describe('App', () => {
  afterEach(cleanup)

  it('presents Project Pet as a local MVP dashboard', async () => {
    renderApp()

    expect(screen.getByText('Project Pet')).toBeDefined()
    const demoStatus = screen.getByRole('status')

    expect(demoStatus.textContent).toContain('Local MVP · Demo mode')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Dashboard',
      }),
    ).toBeDefined()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('main')).toBeDefined()
    expect(screen.getByRole('contentinfo')).toBeDefined()
  })

  it('renders the complete accessible zero-data dashboard', async () => {
    renderApp()

    expect(await screen.findByText('Period income: 0')).not.toBeNull()
    expect(screen.getByRole('group', { name: 'Dashboard period' })).not.toBeNull()
    expect(screen.getByText('Estimated cash result — not net profit: 0')).not.toBeNull()
  })

  it('retains shell navigation and its local-only disclosure', async () => {
    renderApp()

    await screen.findByText('Period income: 0')
    expect(screen.getByText('Local-only MVP. No account, cloud sync, or client data is connected.')).toBeDefined()
    const main = screen.getByRole('main')
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })

    expect(main.id).toBe('main-content')
    expect(skipLink.getAttribute('href')).toBe(`#${main.id}`)
    expect(screen.getAllByRole('link')).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Refresh dashboard' })).not.toBeNull()
  })
})
