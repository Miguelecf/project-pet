// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { Layout } from './Layout'

describe('Layout', () => {
  afterEach(cleanup)

  it('renders the local demo header, module navigation, and a skip target', () => {
    render(
      <MemoryRouter>
        <Layout>
          <h1>Example page</h1>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('Project Pet')).toBeDefined()
    expect(screen.getByRole('status').textContent).toContain('Local MVP · Demo mode')
    expect(screen.getByRole('link', { name: 'Suppliers' }).getAttribute('href')).toBe('/suppliers')
    expect(screen.getByRole('main').id).toBe('main-content')
    expect(screen.getByRole('link', { name: 'Skip to main content' }).getAttribute('href')).toBe('#main-content')
  })

  it('leaves initial focus at the document so the skip link remains first in keyboard traversal', () => {
    render(
      <MemoryRouter>
        <Layout><h1>Example page</h1></Layout>
      </MemoryRouter>,
    )

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })

    expect(document.activeElement).toBe(document.body)
    skipLink.focus()
    expect(document.activeElement).toBe(skipLink)
    expect(skipLink.matches(':focus')).toBe(true)
    expect(skipLink.matches(':focus-visible')).toBe(true)
  })

  it('moves focus to the new page heading after route navigation', () => {
    render(
      <MemoryRouter initialEntries={['/suppliers']}>
        <Routes>
          <Route element={<Layout><h1>Suppliers</h1></Layout>} path="/suppliers" />
          <Route element={<Layout><h1>Categories</h1></Layout>} path="/categories" />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Categories' }))

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'Categories' }))
  })

  it('moves focus to main content when the skip link is activated with Enter', () => {
    render(
      <MemoryRouter>
        <Layout><h1>Example page</h1></Layout>
      </MemoryRouter>,
    )

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })
    skipLink.focus()
    fireEvent.keyDown(skipLink, { key: 'Enter' })
    // jsdom does not perform an anchor's native Enter-to-click default action.
    fireEvent.click(skipLink)

    expect(document.activeElement).toBe(screen.getByRole('main'))
  })

  it('moves focus to main content when the focused skip link is activated with Space', () => {
    render(
      <MemoryRouter>
        <Layout><h1>Example page</h1></Layout>
      </MemoryRouter>,
    )

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })
    skipLink.focus()
    fireEvent.keyDown(skipLink, { key: ' ' })

    expect(document.activeElement).toBe(screen.getByRole('main'))
  })
})
