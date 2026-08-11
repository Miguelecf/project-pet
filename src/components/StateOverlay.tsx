import { useEffect, useState, type ReactNode } from 'react'

type OverlayState = 'loading' | 'error' | 'empty'

interface StateOverlayProps {
  children: ReactNode
  emptyActionLabel?: string
  emptyMessage?: string
  error?: string
  onDismiss?: () => void
  onEmptyAction?: () => void
  onRetry?: () => void
  state: OverlayState
}

export function StateOverlay({
  children,
  emptyActionLabel,
  emptyMessage = 'There is nothing here yet.',
  error = 'Something went wrong.',
  onDismiss,
  onEmptyAction,
  onRetry,
  state,
}: StateOverlayProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [state])

  return (
    <div className="state-overlay-container">
      <div inert={state === 'loading' ? true : undefined}>{children}</div>
      {!dismissed && <div className="state-overlay" role={state === 'error' ? 'alert' : 'status'}>
        {state === 'loading' && <p>Loading…</p>}
        {state === 'loading' && <span aria-label="Loading" className="state-overlay__spinner" role="progressbar" />}
        {state === 'error' && (
          <>
            <p>{error}</p>
            <div className="state-overlay__actions">
              <button onClick={onRetry} type="button">Retry</button>
              <button onClick={() => {
                setDismissed(true)
                onDismiss?.()
              }} type="button">Dismiss</button>
            </div>
          </>
        )}
        {state === 'empty' && (
          <>
            <p>{emptyMessage}</p>
            {emptyActionLabel && onEmptyAction && (
              <button onClick={onEmptyAction} type="button">{emptyActionLabel}</button>
            )}
          </>
        )}
      </div>}
    </div>
  )
}
