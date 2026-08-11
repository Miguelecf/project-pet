// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(cleanup)

  it('presents Project Pet as a local MVP dashboard foundation', () => {
    render(<MemoryRouter><App /></MemoryRouter>)

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
    render(<MemoryRouter><App /></MemoryRouter>)

    const capabilities = screen.getByRole('list', { name: 'Planned capabilities' })
    const listItems = within(capabilities).getAllByRole('listitem')

    expect(listItems).toHaveLength(3)

    for (const capability of ['Supplier expenses', 'Daily income', 'Cash visibility']) {
      const item = listItems.find((listItem) => within(listItem).queryByRole('heading', { name: capability }))

      expect(item).toBeDefined()
      expect(within(item!).getByText('Planned')).toBeDefined()
    }
  })

  it('discloses unavailable features and only exposes the skip link', () => {
    render(<MemoryRouter><App /></MemoryRouter>)

    expect(screen.getByText(/Financial records, calculations, and navigation are not available yet/)).toBeDefined()
    expect(screen.getByText('Local-only MVP. No account, cloud sync, or client data is connected.')).toBeDefined()
    const main = screen.getByRole('main')
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })

    expect(main.id).toBe('main-content')
    expect(skipLink.getAttribute('href')).toBe(`#${main.id}`)
    expect(screen.getAllByRole('link')).toHaveLength(7)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
