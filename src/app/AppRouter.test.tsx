// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it.each([
    ['/', 'Así está tu negocio'],
    ['/categories/new', 'Crear categoría'],
    ['/invoices/example-id', 'No encontramos la factura.'],
    ['/daily-income/new', 'Crear ingreso diario'],
  ])('renders the expected page for %s', async (path, heading) => {
    window.history.replaceState({}, '', path)

    render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: heading })).textContent).toBe(heading)
  })

  it('renders the supplier empty-state create action at /suppliers', async () => {
    window.history.replaceState({}, '', '/suppliers')

    render(<AppRouter />)

    expect((await screen.findByRole('button', { name: 'Crear proveedor' })).textContent).toBe('Crear proveedor')
  })

  it('redirects the removed settings route to the dashboard', async () => {
    window.history.replaceState({}, '', '/settings')

    render(<AppRouter />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Así está tu negocio' })).toBeDefined()
    expect(window.location.pathname).toBe('/')
  })

  it('redirects an unknown route to the dashboard', async () => {
    window.history.replaceState({}, '', '/nonexistent')

    render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: 'Así está tu negocio' })).textContent).toBe('Así está tu negocio')
    expect(window.location.pathname).toBe('/')
  })

  it('renders the pre-filled supplier edit form for a client-side supplier route', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/suppliers/demo-supplier-a/edit')

    render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: 'Editar proveedor' })).textContent).toBe('Editar proveedor')
    expect((screen.getByLabelText('Nombre del proveedor') as HTMLInputElement).value).toBe('Laboratorio VetSalud')
  })

  it('navigates from a list edit link to the pre-filled supplier form', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/suppliers')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'Editar Laboratorio VetSalud' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Editar proveedor' })).textContent).toBe('Editar proveedor')
    expect((screen.getByLabelText('Nombre del proveedor') as HTMLInputElement).value).toBe('Laboratorio VetSalud')
  })

  it('navigates from a category list edit link to the pre-filled category form', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/categories')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'Editar Medicamentos' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Editar categoría' })).textContent).toBe('Editar categoría')
    expect((screen.getByLabelText('Nombre de la categoría') as HTMLInputElement).value).toBe('Medicamentos')
  })

  it('navigates from the category list New Category action to the create form', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/categories')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'Crear categoría' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Crear categoría' })).textContent).toBe('Crear categoría')
    expect(window.location.pathname).toBe('/categories/new')
  })

  it('navigates from the empty category New Category action to the create form', async () => {
    const gateway = new LocalStateGateway(window.localStorage)
    await gateway.write({ ...gateway.read(), categories: [] })
    window.history.replaceState({}, '', '/categories')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('button', { name: 'Crear categoría' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Crear categoría' })).textContent).toBe('Crear categoría')
    expect(window.location.pathname).toBe('/categories/new')
  })

  it('wires create and edit invoice routes without implementing the deferred list or detail pages', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/new')
    const { unmount } = render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: 'Crear factura' })).textContent).toBe('Crear factura')
    unmount()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending/edit')
    render(<AppRouter />)
    expect((await screen.findByRole('heading', { level: 1, name: 'Editar factura' })).textContent).toBe('Editar factura')
    expect((screen.getByLabelText('Referencia del producto') as HTMLInputElement).value).toBe('PROD-001')
  })

  it('routes active invoice list links to a full derived-status detail page', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'DEMO-200' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'DEMO-200' })).textContent).toBe('DEMO-200')
    expect(screen.getByLabelText('Estado: Pago parcial').textContent).toBe('Pago parcial')
    expect(screen.getByText('Saldo: 10250').textContent).toBe('Saldo: 10250')
  })

  it('persists half-up invoice line totals through the real provider on create and displays them after edit-route refetch', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/new')
    const { unmount } = render(<AppRouter />)

    fireEvent.click(await screen.findByRole('button', { name: 'Agregar línea' }))
    fireEvent.change(screen.getByLabelText('Proveedor'), { target: { value: 'demo-supplier-a' } })
    fireEvent.change(screen.getByLabelText('Fecha de emisión'), { target: { value: '2026-08-11' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'demo-category-1' } })
    fireEvent.change(screen.getByLabelText('Referencia del producto'), { target: { value: 'CREATE-FRACTION' } })
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Created fractional line' } })
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '1.255' } })
    fireEvent.change(screen.getByLabelText('Costo unitario (unidades mínimas)'), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().invoices).toHaveLength(31))
    const created = gateway.read().invoices.find((invoice) => invoice.docRef === null && invoice.totalMinor === 126)
    expect(created).toEqual(expect.objectContaining({ supplierId: 'demo-supplier-a', issueDate: '2026-08-11', currency: 'ARS', totalMinor: 126, status: 'pending' }))
    expect(gateway.read().invoiceLines.find((line) => line.invoiceId === created?.id)).toEqual(expect.objectContaining({ categoryId: 'demo-category-1', productRef: 'CREATE-FRACTION', description: 'Created fractional line', quantity: 1.255, unitCostMinor: 100, lineTotalMinor: 126 }))

    unmount()
    window.history.replaceState({}, '', `/invoices/${created?.id}/edit`)
    render(<AppRouter />)
    expect((await screen.findByLabelText('Referencia del producto') as HTMLInputElement).value).toBe('CREATE-FRACTION')
    expect((screen.getByLabelText('Cantidad') as HTMLInputElement).value).toBe('1.255')
    expect(screen.getByText('Total de la línea: 126').textContent).toBe('Total de la línea: 126')
  })

  it('persists edited invoice fields and recomputed line totals through the real provider after refetch', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending/edit')
    const { unmount } = render(<AppRouter />)

    await screen.findByRole('heading', { level: 1, name: 'Editar factura' })
    fireEvent.change(screen.getByLabelText('Fecha de vencimiento'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '1.255' } })
    fireEvent.change(screen.getByLabelText('Costo unitario (unidades mínimas)'), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().invoices.find((invoice) => invoice.id === 'demo-invoice-pending')?.totalMinor).toBe(126))
    expect(gateway.read().invoices.find((invoice) => invoice.id === 'demo-invoice-pending')).toEqual(expect.objectContaining({ dueDate: '2026-09-01', totalMinor: 126, status: 'pending' }))
    expect(gateway.read().invoiceLines.find((line) => line.invoiceId === 'demo-invoice-pending')).toEqual(expect.objectContaining({ productRef: 'PROD-001', quantity: 1.255, unitCostMinor: 100, lineTotalMinor: 126 }))

    unmount()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending/edit')
    render(<AppRouter />)
    expect((await screen.findByLabelText('Fecha de vencimiento') as HTMLInputElement).value).toBe('2026-09-01')
    expect((screen.getByLabelText('Cantidad') as HTMLInputElement).value).toBe('1.255')
    expect(screen.getByText('Total de la línea: 126').textContent).toBe('Total de la línea: 126')
  })

  it('persists payment registration and voiding through the real provider and refreshes invoice detail balances', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending')
    render(<AppRouter />)

    await screen.findByRole('heading', { level: 1, name: 'DEMO-100' })
    await screen.findByLabelText('Monto del pago (unidades mínimas)')
    fireEvent.change(screen.getByLabelText('Monto del pago (unidades mínimas)'), { target: { value: '4000' } })
    fireEvent.change(screen.getByLabelText('Fecha de pago'), { target: { value: '2026-08-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar pago' }))

    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().payments.find((payment) => payment.invoiceId === 'demo-invoice-pending')).toEqual(expect.objectContaining({ amountMinor: 4000, isVoid: false })))
    expect((await screen.findByText('Saldo: 8000')).textContent).toBe('Saldo: 8000')
    expect(screen.getByLabelText('Estado: Pago parcial').textContent).toBe('Pago parcial')

    const registeredPayment = gateway.read().payments.find((payment) => payment.invoiceId === 'demo-invoice-pending')
    fireEvent.change(screen.getByLabelText(`Motivo de anulación para ${registeredPayment?.id}`), { target: { value: 'Recorded twice' } })
    fireEvent.click(screen.getByRole('button', { name: `Anular pago ${registeredPayment?.id}` }))
    fireEvent.click(screen.getByRole('button', { name: 'Anular pago' }))
    await waitFor(() => expect(gateway.read().payments.find((payment) => payment.invoiceId === 'demo-invoice-pending')).toEqual(expect.objectContaining({ isVoid: true, voidReason: 'Recorded twice' })))
    expect((await screen.findByText('Saldo: 12000')).textContent).toBe('Saldo: 12000')
    expect(screen.getByLabelText('Estado: Pendiente').textContent).toBe('Pendiente')
  })

  it('persists deletion, excludes it from the active list, and restores it from the retained filter', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending')
    render(<AppRouter />)

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar factura' }))
    const deleteDialog = await screen.findByRole('dialog')
    fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Eliminar' }))
    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().invoices.find((invoice) => invoice.id === 'demo-invoice-pending')?.deletedAt).not.toBeNull())
    expect(await screen.findByRole('heading', { level: 1, name: 'Facturas' })).not.toBeNull()
    expect(screen.queryByRole('link', { name: 'DEMO-100' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Ver facturas eliminadas' }))
    fireEvent.click(within(await screen.findByRole('row', { name: /DEMO-100/ })).getByRole('button', { name: 'Restaurar' }))
    const restoreDialog = await screen.findByRole('dialog')
    fireEvent.click(within(restoreDialog).getByRole('button', { name: 'Restaurar' }))
    await waitFor(() => expect(gateway.read().invoices.find((invoice) => invoice.id === 'demo-invoice-pending')?.deletedAt).toBeNull())
    expect(await screen.findByRole('link', { name: 'DEMO-100' })).not.toBeNull()
  })

  it('persists a daily income through create and edit routes, then refreshes the provider-backed list', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/daily-income/new')
    const { unmount } = render(<AppRouter />)

    fireEvent.change(await screen.findByLabelText('Fecha de venta'), { target: { value: '2026-08-11' } })
    fireEvent.change(screen.getByLabelText('Monto (unidades mínimas)'), { target: { value: '25000' } })
    fireEvent.change(screen.getByLabelText('Nota (opcional)'), { target: { value: 'Counter sale' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().dailyIncomes.find((income) => income.saleDate === '2026-08-11')).toEqual(expect.objectContaining({ amountMinor: 25000, currency: 'ARS', note: 'Counter sale' })))
    const created = gateway.read().dailyIncomes.find((income) => income.saleDate === '2026-08-11')
    expect(await screen.findByRole('row', { name: /2026-08-11 25000 ARS Counter sale/ })).not.toBeNull()

    unmount()
    window.history.replaceState({}, '', `/daily-income/${created?.id}/edit`)
    render(<AppRouter />)
    fireEvent.change(await screen.findByLabelText('Monto (unidades mínimas)'), { target: { value: '30000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(gateway.read().dailyIncomes.find((income) => income.id === created?.id)?.amountMinor).toBe(30000))
    expect(await screen.findByRole('row', { name: /2026-08-11 30000 ARS Counter sale/ })).not.toBeNull()
  })
})
