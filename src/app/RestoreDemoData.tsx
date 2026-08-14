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
    <section aria-label="Controles de datos de ejemplo" className="restore-demo-data">
      <button onClick={() => setConfirming(true)} type="button">Restaurar datos de ejemplo</button>
      {success && <p role="status">Datos de ejemplo restaurados.</p>}
      {error && (
        <div role="alert">
          <p>No pudimos restaurar los datos de ejemplo.</p>
          <button onClick={() => void handleRestore()} type="button">Reintentar</button>
        </div>
      )}
      <ConfirmDialog
        cancelLabel="Cancelar"
        confirmLabel="Restaurar"
        message="Esto reemplaza todos los datos locales de ejemplo por los datos originales."
        onCancel={() => setConfirming(false)}
        onConfirm={() => void handleRestore()}
        open={confirming}
        title="¿Restaurar datos de ejemplo?"
      />
    </section>
  )
}
