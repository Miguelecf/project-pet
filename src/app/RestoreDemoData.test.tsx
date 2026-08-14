// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../infrastructure/local/LocalRepositoryTestFixtures'
import { RepositoryProvider } from './RepositoryProvider'
import { RestoreDemoData } from './RestoreDemoData'
import { useRepositories } from './useRepositories'

function SupplierNames() {
  const { repositories, revision } = useRepositories()
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    void repositories.suppliers.findAll().then((suppliers) => setNames(suppliers.map((supplier) => supplier.name)))
  }, [repositories, revision])

  return <p>Proveedores: {names.join(', ')}</p>
}

function AddSupplier() {
  const { repositories } = useRepositories()
  return <button onClick={() => void repositories.suppliers.create({ name: 'Temporary supplier', defaultDueDays: null })} type="button">Agregar proveedor temporal</button>
}

describe('RestoreDemoData', () => {
  afterEach(cleanup)

  it('provides a named restore control, accessible confirmation dialog, and restores deterministic seed data after confirmation', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<RepositoryProvider gateway={gateway}><RestoreDemoData /><AddSupplier /><SupplierNames /></RepositoryProvider>)

    expect(screen.getByRole('button', { name: 'Restaurar datos de ejemplo' })).not.toBeNull()
    expect(await screen.findByText('Proveedores: Demo Supplier A, Demo Supplier B')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar proveedor temporal' }))
    await screen.findByText('Proveedores: Demo Supplier A, Demo Supplier B, Temporary supplier')
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar datos de ejemplo' }))

    const dialog = screen.getByRole('dialog', { name: '¿Restaurar datos de ejemplo?' })
    expect(within(dialog).getByText('Esto reemplaza todos los datos locales de ejemplo por los datos originales.')).not.toBeNull()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Restaurar' }))

    await screen.findByText('Datos de ejemplo restaurados.')
    await waitFor(() => expect(screen.getByText('Proveedores: Demo Supplier A, Demo Supplier B')).not.toBeNull())
  })

  it('keeps data unchanged when the confirmation dialog is cancelled', async () => {
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<RepositoryProvider gateway={gateway}><RestoreDemoData /><AddSupplier /><SupplierNames /></RepositoryProvider>)

    await screen.findByText('Proveedores: Demo Supplier A, Demo Supplier B')
    fireEvent.click(screen.getByRole('button', { name: 'Agregar proveedor temporal' }))
    await screen.findByText('Proveedores: Demo Supplier A, Demo Supplier B, Temporary supplier')
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar datos de ejemplo' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Proveedores: Demo Supplier A, Demo Supplier B, Temporary supplier')).not.toBeNull()
  })

  it('shows retryable feedback when restoring data fails', async () => {
    let failOnce = true
    const storage = {
      getItem: () => null,
      setItem: () => {
        if (failOnce) {
          failOnce = false
          throw new Error('storage unavailable')
        }
      },
    }
    render(<RepositoryProvider gateway={new LocalStateGateway(storage)}><RestoreDemoData /></RepositoryProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar datos de ejemplo' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Restaurar' }))

    expect((await screen.findByRole('alert')).textContent).toContain('No pudimos restaurar los datos de ejemplo.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await screen.findByText('Datos de ejemplo restaurados.')
    expect(failOnce).toBe(false)
  })
})
