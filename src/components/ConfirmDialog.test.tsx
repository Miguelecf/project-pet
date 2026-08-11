// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

function DialogHarness({ onConfirm = vi.fn(), onCancel = vi.fn() }: { onConfirm?: () => void; onCancel?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} type="button">Delete supplier</button>
      <ConfirmDialog
        cancelLabel="Keep supplier"
        confirmLabel="Delete supplier"
        message="This cannot be undone."
        onCancel={() => {
          onCancel()
          setOpen(false)
        }}
        onConfirm={() => {
          onConfirm()
          setOpen(false)
        }}
        open={open}
        title="Delete this supplier?"
      />
    </>
  )
}

describe('ConfirmDialog', () => {
  afterEach(cleanup)

  it('confirms the action and restores focus to its trigger after closing', async () => {
    const onConfirm = vi.fn()
    render(<DialogHarness onConfirm={onConfirm} />)

    const trigger = screen.getByRole('button', { name: 'Delete supplier' })
    trigger.focus()
    fireEvent.click(trigger)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete supplier' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('cancels on Escape and cycles Tab focus inside the dialog', async () => {
    const onCancel = vi.fn()
    render(<DialogHarness onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete supplier' }))
    const dialog = screen.getByRole('dialog')
    const cancel = within(dialog).getByRole('button', { name: 'Keep supplier' })
    const confirm = within(dialog).getByRole('button', { name: 'Delete supplier' })

    cancel.focus()
    fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirm)
    fireEvent.keyDown(confirm, { key: 'Tab' })
    expect(document.activeElement).toBe(cancel)
    fireEvent.keyDown(cancel, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
