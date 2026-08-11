// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

const setViewport = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  act(() => window.dispatchEvent(new Event('resize')))
}

describe('Sidebar', () => {
  beforeEach(() => {
    setViewport(1024)
  })

  afterEach(cleanup)

  it('renders semantic NavLinks for every module on desktop', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined()
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Dashboard',
      'Suppliers',
      'Categories',
      'Invoices',
      'Daily income',
      'Settings',
    ])
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
  })

  it('marks the current route as the active navigation link', () => {
    render(
      <MemoryRouter initialEntries={['/suppliers']}>
        <Sidebar />
      </MemoryRouter>,
    )

    const suppliersLink = screen.getByRole('link', { name: 'Suppliers' })

    expect(suppliersLink.getAttribute('aria-current')).toBe('page')
    expect(suppliersLink.classList.contains('active')).toBe(true)
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBeNull()
  })

  it('collapses on mobile and toggles its navigation open', () => {
    setViewport(320)
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'Open navigation' })
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull()

    fireEvent.click(toggle)

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined()
    const closeButton = screen.getByRole('button', { name: 'Close navigation' })

    fireEvent.click(closeButton)

    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('returns to desktop navigation when the viewport grows', () => {
    setViewport(320)
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull()

    setViewport(1024)

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeDefined()
  })
})
