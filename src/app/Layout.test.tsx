// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
})
