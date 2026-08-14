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

    expect(demoStatus.textContent).toContain('MVP local · Modo demo')
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Así está tu negocio',
      }),
    ).toBeDefined()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('main')).toBeDefined()
    expect(screen.getByRole('contentinfo')).toBeDefined()
  })

  it('renders the complete accessible zero-data dashboard', async () => {
    renderApp()

    expect(await screen.findByText('Entró a caja: 0')).not.toBeNull()
    expect(screen.getByRole('group', { name: 'Período a consultar' })).not.toBeNull()
    expect(screen.getByText('Resultado de caja')).not.toBeNull()
    expect(screen.getByText('Es una estimación, no una ganancia final.')).not.toBeNull()
  })

  it('retains shell navigation and its local-only disclosure', async () => {
    renderApp()

    await screen.findByText('Entró a caja: 0')
    expect(screen.getByText('MVP solo local. No hay cuenta, sincronización en la nube ni datos de clientes conectados.')).toBeDefined()
    const main = screen.getByRole('main')
    const skipLink = screen.getByRole('link', { name: 'Ir al contenido principal' })

    expect(main.id).toBe('main-content')
    expect(skipLink.getAttribute('href')).toBe(`#${main.id}`)
    expect(screen.getAllByRole('link')).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Actualizar datos' })).not.toBeNull()
  })
})
