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

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeDefined()
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Resumen',
      'Proveedores',
      'Categorías',
      'Facturas',
      'Ingresos diarios',
    ])
    expect(screen.queryByRole('button', { name: 'Abrir navegación' })).toBeNull()
  })

  it('marks the current route as the active navigation link', () => {
    render(
      <MemoryRouter initialEntries={['/suppliers']}>
        <Sidebar />
      </MemoryRouter>,
    )

    const suppliersLink = screen.getByRole('link', { name: 'Proveedores' })

    expect(suppliersLink.getAttribute('aria-current')).toBe('page')
    expect(suppliersLink.classList.contains('active')).toBe(true)
    expect(screen.getByRole('link', { name: 'Resumen' }).getAttribute('aria-current')).toBeNull()
  })

  it('collapses on mobile and toggles its navigation open', () => {
    setViewport(320)
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'Abrir navegación' })
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).toBeNull()

    fireEvent.click(toggle)

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeDefined()
    const closeButton = screen.getByRole('button', { name: 'Cerrar navegación' })

    fireEvent.click(closeButton)

    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Abrir navegación' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('returns to desktop navigation when the viewport grows', () => {
    setViewport(320)
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).toBeNull()

    setViewport(1024)

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeDefined()
  })
})
