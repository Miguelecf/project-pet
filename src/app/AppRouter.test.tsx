// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  afterEach(cleanup)

  it.each([
    ['/', 'A clear view of daily operations, starting here.'],
    ['/categories/new', 'Categories'],
    ['/invoices/example-id', 'Invoices'],
    ['/daily-income/new', 'Daily income'],
    ['/settings', 'Settings'],
  ])('renders the expected page for %s', async (path, heading) => {
    window.history.replaceState({}, '', path)

    render(<AppRouter />)

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeDefined()
  })

  it('renders the supplier empty-state create action at /suppliers', async () => {
    window.history.replaceState({}, '', '/suppliers')

    render(<AppRouter />)

    expect(await screen.findByRole('button', { name: 'Create Supplier' })).toBeDefined()
  })

  it('redirects an unknown route to the dashboard', () => {
    window.history.replaceState({}, '', '/nonexistent')

    render(<AppRouter />)

    expect(screen.getByRole('heading', { level: 1, name: 'A clear view of daily operations, starting here.' })).toBeDefined()
    expect(window.location.pathname).toBe('/')
  })

  it('renders the pre-filled supplier edit form for a client-side supplier route', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/suppliers/demo-supplier-a/edit')

    render(<AppRouter />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Edit supplier' })).toBeDefined()
    expect((screen.getByLabelText('Supplier name') as HTMLInputElement).value).toBe('Demo Supplier A')
  })
})
