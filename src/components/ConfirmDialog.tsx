import { useEffect, useRef } from 'react'

function isRestorableFocusTarget(element: HTMLElement): boolean {
  return element.isConnected
    && !element.matches(':disabled')
    && !element.hasAttribute('inert')
    && element.tabIndex >= 0
}

interface ConfirmDialogProps {
  cancelLabel: string
  confirmLabel: string
  message: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title: string
}

export function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    previouslyFocusedElement.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    confirmButtonRef.current?.focus()

    return () => {
      const focusTarget = previouslyFocusedElement.current

      if (focusTarget && isRestorableFocusTarget(focusTarget)) {
        focusTarget.focus()
      }

      previouslyFocusedElement.current = null
    }
  }, [open])

  if (!open) {
    return null
  }

  function trapFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'))
    const first = focusableElements[0]
    const last = focusableElements.at(-1)

    if (!first || !last) {
      return
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="confirm-dialog-backdrop">
      <div aria-describedby="confirm-dialog-message" aria-labelledby="confirm-dialog-title" aria-modal="true" className="confirm-dialog" onKeyDown={trapFocus} role="dialog">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog__actions">
          <button onClick={onCancel} type="button">{cancelLabel}</button>
          <button onClick={onConfirm} ref={confirmButtonRef} type="button">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
