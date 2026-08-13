// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RepositoryProvider } from '../app/RepositoryProvider'
import { useRepositories } from '../app/useRepositories'
import { LocalStateGateway } from '../infrastructure/local/LocalStateGateway'
import { MemoryStorage } from '../infrastructure/local/LocalRepositoryTestFixtures'

function InvoiceLifecycle() {
  const { repositories, revision } = useRepositories()
  const [result, setResult] = useState('')
  const run = async () => {
    const created = await repositories.invoices.create({
      supplierId: 'demo-supplier-a' as never, docRef: 'INTEGRATION-LIFECYCLE', issueDate: '2026-08-10' as never,
      dueDate: null, currency: 'USD', notes: null,
      lines: [{ categoryId: 'demo-category-1' as never, productRef: 'FLOW-1', externalSku: null, description: 'Lifecycle item', quantity: 1 as never, unitCostMinor: 10000 as never }],
    })
    const partial = await repositories.payments.register({ invoiceId: created.invoice.id, amountMinor: 4000 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })
    const partialStatus = await repositories.payments.getBalance(created.invoice.id)
    const full = await repositories.payments.register({ invoiceId: created.invoice.id, amountMinor: 6000 as never, paymentDate: '2026-08-10' as never, method: 'cash', reference: null, notes: null })
    const paidStatus = await repositories.payments.getBalance(created.invoice.id)
    await repositories.payments.void(partial.id, 'Partial payment reversed')
    const oneVoidedStatus = await repositories.payments.getBalance(created.invoice.id)
    await repositories.payments.void(full.id, 'Full payment reversed')
    await repositories.invoices.softDelete(created.invoice.id)
    const deleted = await repositories.invoices.findDeleted()
    await repositories.invoices.restore(created.invoice.id)
    const active = await repositories.invoices.findAll()
    setResult(JSON.stringify({
      partial: partialStatus.status,
      paid: paidStatus.status,
      afterOneVoid: oneVoidedStatus.status,
      afterAllVoids: (await repositories.payments.getBalance(created.invoice.id)).status,
      deleted: deleted.some((invoice) => invoice.id === created.invoice.id && invoice.deletedAt !== null),
      restored: active.some((invoice) => invoice.id === created.invoice.id && invoice.deletedAt === null),
    }))
  }
  return <><button onClick={() => void run()}>Run invoice lifecycle</button><output data-testid="revision">{revision}</output><output data-testid="lifecycle-result">{result}</output></>
}

describe('invoice lifecycle integration', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('conserves the created invoice through partial/full payments, voiding, deletion, deleted filtering, and restoration', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValueOnce('invoice-q3').mockReturnValueOnce('line-q3').mockReturnValueOnce('payment-partial-q3').mockReturnValueOnce('payment-full-q3') })
    const gateway = new LocalStateGateway(new MemoryStorage())
    await gateway.loadSeed()
    render(<RepositoryProvider gateway={gateway}><InvoiceLifecycle /></RepositoryProvider>)

    screen.getByRole('button', { name: 'Run invoice lifecycle' }).click()

    await waitFor(() => expect(screen.getByTestId('lifecycle-result').textContent).toBe('{"partial":"partially_paid","paid":"paid","afterOneVoid":"partially_paid","afterAllVoids":"pending","deleted":true,"restored":true}'))
    expect(screen.getByTestId('revision').textContent).toBe('7')
    const stored = gateway.read().invoices.find((invoice) => invoice.id === 'invoice-q3')
    expect(stored).toEqual(expect.objectContaining({ docRef: 'INTEGRATION-LIFECYCLE', deletedAt: null, status: 'pending', totalMinor: 10000 }))
    expect(gateway.read().payments.filter((payment) => payment.invoiceId === 'invoice-q3')).toEqual([
      expect.objectContaining({ id: 'payment-partial-q3', amountMinor: 4000, isVoid: true }),
      expect.objectContaining({ id: 'payment-full-q3', amountMinor: 6000, isVoid: true }),
    ])
  })
})
