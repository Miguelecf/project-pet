import { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useRepositories } from './useRepositories'

export function RestoreDemoData() {
  const { restore } = useRepositories()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRestore() {
    setConfirming(false)
    setError(false)
    setSuccess(false)

    try {
      await restore()
      setSuccess(true)
    } catch {
      setError(true)
    }
  }

  return (
    <section aria-label="Demo data controls" className="restore-demo-data">
      <button onClick={() => setConfirming(true)} type="button">Restore demo data</button>
      {success && <p role="status">Demo data restored.</p>}
      {error && (
        <div role="alert">
          <p>Could not restore demo data.</p>
          <button onClick={() => void handleRestore()} type="button">Retry restore demo data</button>
        </div>
      )}
      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Restore demo data"
        message="This replaces all local demo data with the original seed data."
        onCancel={() => setConfirming(false)}
        onConfirm={() => void handleRestore()}
        open={confirming}
        title="Restore demo data?"
      />
    </section>
  )
}
