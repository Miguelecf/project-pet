// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it.each([
    ['/', 'A clear view of daily operations, starting here.'],
    ['/categories/new', 'Create category'],
    ['/invoices/example-id', 'Invoices'],
    ['/daily-income/new', 'Daily income'],
    ['/settings', 'Settings'],
  ])('renders the expected page for %s', async (path, heading) => {
    window.history.replaceState({}, '', path)

    render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: heading })).textContent).toBe(heading)
  })

  it('renders the supplier empty-state create action at /suppliers', async () => {
    window.history.replaceState({}, '', '/suppliers')

    render(<AppRouter />)

    expect((await screen.findByRole('button', { name: 'Create Supplier' })).textContent).toBe('Create Supplier')
  })

  it('renders the settings form with accessible current-value controls at /settings', async () => {
    window.history.replaceState({}, '', '/settings')

    render(<AppRouter />)

    expect((await screen.findByLabelText('Currency') as HTMLSelectElement).value).toBe('USD')
    expect((screen.getByLabelText('Due alert days') as HTMLInputElement).value).toBe('7')
    expect(screen.getByRole('button', { name: 'Save settings' }).textContent).toBe('Save settings')
  })

  it('redirects an unknown route to the dashboard', () => {
    window.history.replaceState({}, '', '/nonexistent')

    render(<AppRouter />)

    expect(screen.getByRole('heading', { level: 1, name: 'A clear view of daily operations, starting here.' }).textContent).toBe('A clear view of daily operations, starting here.')
    expect(window.location.pathname).toBe('/')
  })

  it('renders the pre-filled supplier edit form for a client-side supplier route', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/suppliers/demo-supplier-a/edit')

    render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: 'Edit supplier' })).textContent).toBe('Edit supplier')
    expect((screen.getByLabelText('Supplier name') as HTMLInputElement).value).toBe('Demo Supplier A')
  })

  it('navigates from a list edit link to the pre-filled supplier form', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/suppliers')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'Edit Demo Supplier A' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Edit supplier' })).textContent).toBe('Edit supplier')
    expect((screen.getByLabelText('Supplier name') as HTMLInputElement).value).toBe('Demo Supplier A')
  })

  it('navigates from a category list edit link to the pre-filled category form', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/categories')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'Edit Demo Category A' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Edit category' })).textContent).toBe('Edit category')
    expect((screen.getByLabelText('Category name') as HTMLInputElement).value).toBe('Demo Category A')
  })

  it('navigates from the category list New Category action to the create form', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/categories')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('link', { name: 'New Category' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Create category' })).textContent).toBe('Create category')
    expect(window.location.pathname).toBe('/categories/new')
  })

  it('navigates from the empty category New Category action to the create form', async () => {
    const gateway = new LocalStateGateway(window.localStorage)
    await gateway.write({ ...gateway.read(), categories: [] })
    window.history.replaceState({}, '', '/categories')

    render(<AppRouter />)
    fireEvent.click(await screen.findByRole('button', { name: 'New Category' }))

    expect((await screen.findByRole('heading', { level: 1, name: 'Create category' })).textContent).toBe('Create category')
    expect(window.location.pathname).toBe('/categories/new')
  })

  it('wires create and edit invoice routes without implementing the deferred list or detail pages', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/new')
    const { unmount } = render(<AppRouter />)

    expect((await screen.findByRole('heading', { level: 1, name: 'Create invoice' })).textContent).toBe('Create invoice')
    unmount()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending/edit')
    render(<AppRouter />)
    expect((await screen.findByRole('heading', { level: 1, name: 'Edit invoice' })).textContent).toBe('Edit invoice')
    expect((screen.getByLabelText('Product reference') as HTMLInputElement).value).toBe('DEMO-PENDING')
  })

  it('persists half-up invoice line totals through the real provider on create and displays them after edit-route refetch', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/new')
    const { unmount } = render(<AppRouter />)

    fireEvent.click(await screen.findByRole('button', { name: 'Add line' }))
    fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: 'demo-supplier-a' } })
    fireEvent.change(screen.getByLabelText('Issue date'), { target: { value: '2026-08-10' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'demo-category-1' } })
    fireEvent.change(screen.getByLabelText('Product reference'), { target: { value: 'CREATE-FRACTION' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Created fractional line' } })
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1.255' } })
    fireEvent.change(screen.getByLabelText('Unit cost (minor units)'), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))

    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().invoices).toHaveLength(4))
    const created = gateway.read().invoices.find((invoice) => invoice.docRef === null && invoice.totalMinor === 126)
    expect(created).toEqual(expect.objectContaining({ supplierId: 'demo-supplier-a', issueDate: '2026-08-10', currency: 'USD', totalMinor: 126, status: 'pending' }))
    expect(gateway.read().invoiceLines.find((line) => line.invoiceId === created?.id)).toEqual(expect.objectContaining({ categoryId: 'demo-category-1', productRef: 'CREATE-FRACTION', description: 'Created fractional line', quantity: 1.255, unitCostMinor: 100, lineTotalMinor: 126 }))

    unmount()
    window.history.replaceState({}, '', `/invoices/${created?.id}/edit`)
    render(<AppRouter />)
    expect((await screen.findByLabelText('Product reference') as HTMLInputElement).value).toBe('CREATE-FRACTION')
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).value).toBe('1.255')
    expect(screen.getByText('Line total: 126').textContent).toBe('Line total: 126')
  })

  it('persists edited invoice fields and recomputed line totals through the real provider after refetch', async () => {
    await new LocalStateGateway(window.localStorage).loadSeed()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending/edit')
    const { unmount } = render(<AppRouter />)

    await screen.findByRole('heading', { level: 1, name: 'Edit invoice' })
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1.255' } })
    fireEvent.change(screen.getByLabelText('Unit cost (minor units)'), { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save invoice' }))

    const gateway = new LocalStateGateway(window.localStorage)
    await waitFor(() => expect(gateway.read().invoices.find((invoice) => invoice.id === 'demo-invoice-pending')?.totalMinor).toBe(126))
    expect(gateway.read().invoices.find((invoice) => invoice.id === 'demo-invoice-pending')).toEqual(expect.objectContaining({ dueDate: '2026-09-01', totalMinor: 126, status: 'pending' }))
    expect(gateway.read().invoiceLines.find((line) => line.invoiceId === 'demo-invoice-pending')).toEqual(expect.objectContaining({ productRef: 'DEMO-PENDING', quantity: 1.255, unitCostMinor: 100, lineTotalMinor: 126 }))

    unmount()
    window.history.replaceState({}, '', '/invoices/demo-invoice-pending/edit')
    render(<AppRouter />)
    expect((await screen.findByLabelText('Due date') as HTMLInputElement).value).toBe('2026-09-01')
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).value).toBe('1.255')
    expect(screen.getByText('Line total: 126').textContent).toBe('Line total: 126')
  })
})
