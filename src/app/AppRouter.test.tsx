// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  afterEach(cleanup)

  it.each([
    ['/', 'A clear view of daily operations, starting here.'],
    ['/suppliers', 'Suppliers'],
    ['/categories/new', 'Categories'],
    ['/invoices/example-id', 'Invoices'],
    ['/daily-income/new', 'Daily income'],
    ['/settings', 'Settings'],
  ])('renders the expected placeholder for %s', (path, heading) => {
    window.history.replaceState({}, '', path)

    render(<AppRouter />)

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeDefined()
  })

  it('redirects an unknown route to the dashboard', () => {
    window.history.replaceState({}, '', '/nonexistent')

    render(<AppRouter />)

    expect(screen.getByRole('heading', { level: 1, name: 'A clear view of daily operations, starting here.' })).toBeDefined()
    expect(window.location.pathname).toBe('/')
  })
})
