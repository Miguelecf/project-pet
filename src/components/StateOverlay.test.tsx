// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StateOverlay } from './StateOverlay'

describe('StateOverlay', () => {
  afterEach(cleanup)

  it('shows a loading status and makes its content inert', () => {
    render(
      <StateOverlay state="loading">
        <button type="button">Edit supplier</button>
      </StateOverlay>,
    )

    expect(screen.getByRole('status').textContent).toContain('Loading')
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Edit supplier' }).parentElement?.hasAttribute('inert')).toBe(true)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })

  it('retries or dismisses an error through visible actions', () => {
    const onRetry = vi.fn()
    const onDismiss = vi.fn()

    render(
      <StateOverlay error="Could not load suppliers" onDismiss={onDismiss} onRetry={onRetry} state="error">
        <p>Existing content</p>
      </StateOverlay>,
    )

    expect(screen.getByRole('alert').textContent).toContain('Could not load suppliers')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(onRetry).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('offers a create action when an empty state provides one', () => {
    const onCreate = vi.fn()

    render(
      <StateOverlay emptyActionLabel="Create supplier" emptyMessage="No suppliers yet" onEmptyAction={onCreate} state="empty">
        <p>Existing content</p>
      </StateOverlay>,
    )

    expect(screen.getByRole('status').textContent).toContain('No suppliers yet')
    fireEvent.click(screen.getByRole('button', { name: 'Create supplier' }))

    expect(onCreate).toHaveBeenCalledOnce()
  })
})
