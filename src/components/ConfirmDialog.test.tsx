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

function RemovingTriggerHarness() {
  const [open, setOpen] = useState(false)
  const [showTrigger, setShowTrigger] = useState(true)

  return (
    <>
      {showTrigger && <button onClick={() => setOpen(true)} type="button">Delete supplier</button>}
      <ConfirmDialog
        cancelLabel="Keep supplier"
        confirmLabel="Delete supplier"
        message="This cannot be undone."
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setShowTrigger(false)
          setOpen(false)
        }}
        open={open}
        title="Delete this supplier?"
      />
    </>
  )
}

function DirectDialog({ showDialog }: { showDialog: boolean }) {
  return (
    <>
      <button type="button">Delete supplier</button>
      {showDialog && (
        <ConfirmDialog
          cancelLabel="Keep supplier"
          confirmLabel="Delete supplier"
          message="This cannot be undone."
          onCancel={() => undefined}
          onConfirm={() => undefined}
          open
          title="Delete this supplier?"
        />
      )}
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

    const trigger = screen.getByRole('button', { name: 'Delete supplier' })
    trigger.focus()
    fireEvent.click(trigger)
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
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete supplier' })))
  })

  it('restores focus to its trigger after the cancel button closes it', async () => {
    render(<DialogHarness />)

    const trigger = screen.getByRole('button', { name: 'Delete supplier' })
    trigger.focus()
    fireEvent.click(trigger)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Keep supplier' }))

    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('restores focus when an open dialog unmounts', async () => {
    const { rerender } = render(<DirectDialog showDialog={false} />)

    const trigger = screen.getByRole('button', { name: 'Delete supplier' })
    trigger.focus()
    rerender(<DirectDialog showDialog />)
    expect(document.activeElement).toBe(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete supplier' }))
    rerender(<DirectDialog showDialog={false} />)

    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('does not try to restore focus to a disconnected trigger', async () => {
    render(<RemovingTriggerHarness />)

    const trigger = screen.getByRole('button', { name: 'Delete supplier' })
    trigger.focus()
    fireEvent.click(trigger)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete supplier' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(trigger.isConnected).toBe(false)
    expect(screen.queryByRole('button', { name: 'Delete supplier' })).toBeNull()
    expect(document.activeElement).not.toBe(trigger)
    expect(document.activeElement).toBe(document.body)
  })
})
