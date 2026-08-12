// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { RepositoryProvider } from './app/RepositoryProvider'
import App from './App'

function renderApp() {
  return render(<MemoryRouter><RepositoryProvider repositories={{
    invoices: { findAll: async () => [] },
    payments: { findByInvoice: async () => [] },
    settings: { get: async () => ({ dueAlertDays: 7 }) },
  } as never}><App /></RepositoryProvider></MemoryRouter>)
}

describe('App', () => {
  afterEach(cleanup)

  it('presents Project Pet as a local MVP dashboard foundation', () => {
    renderApp()

    expect(screen.getByText('Project Pet')).toBeDefined()
    const demoStatus = screen.getByRole('status')

    expect(demoStatus.textContent).toContain('Local MVP · Demo mode')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'A clear view of daily operations, starting here.',
      }),
    ).toBeDefined()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('main')).toBeDefined()
    expect(screen.getByRole('contentinfo')).toBeDefined()
  })

  it('connects each planned capability to its own list item', () => {
    renderApp()

    const capabilities = screen.getByRole('list', { name: 'Planned capabilities' })
    const listItems = within(capabilities).getAllByRole('listitem')

    expect(listItems).toHaveLength(3)

    for (const capability of ['Supplier expenses', 'Daily income', 'Cash visibility']) {
      const item = listItems.find((listItem) => within(listItem).queryByRole('heading', { name: capability }))

      expect(item).toBeDefined()
      expect(within(item!).getByText('Planned')).toBeDefined()
    }
  })

  it('discloses that navigation is available while feature workflows remain placeholders', () => {
    renderApp()

    expect(
      screen.getByText(/Navigation is available now; financial records and calculations remain placeholders/),
    ).toBeDefined()
    expect(screen.getByText('Local-only MVP. No account, cloud sync, or client data is connected.')).toBeDefined()
    const main = screen.getByRole('main')
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })

    expect(main.id).toBe('main-content')
    expect(skipLink.getAttribute('href')).toBe(`#${main.id}`)
    expect(screen.getAllByRole('link')).toHaveLength(7)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
