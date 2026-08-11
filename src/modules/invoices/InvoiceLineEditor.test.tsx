// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Category } from '../../types/domain'
import { InvoiceLineEditor, type InvoiceLineDraft } from './InvoiceLineEditor'

const categories = [{ id: 'category-1', name: 'Materials' }] as unknown as readonly Category[]
const line: InvoiceLineDraft = { categoryId: 'category-1', productRef: 'BOLT', externalSku: '', description: 'Steel bolt', quantity: '2', unitCostMinor: '150' }

function EditorState({ initialLines = [line] }: { readonly initialLines?: readonly InvoiceLineDraft[] }) {
  const [lines, setLines] = useState(initialLines)
  return <InvoiceLineEditor categories={categories} lines={lines} onChange={setLines} />
}

describe('InvoiceLineEditor', () => {
  afterEach(cleanup)

  it('adds and removes dynamic lines without removing the final required line', () => {
    render(<EditorState />)
    fireEvent.click(screen.getByRole('button', { name: 'Add line' }))
    expect(screen.getAllByRole('group', { name: /^Invoice line \d+$/i })).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove line' })[0])
    expect(screen.getAllByRole('group', { name: /^Invoice line \d+$/i })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Remove line' })).toBeNull()
  })

  it('renders category selection and a total calculated through the finance utility', () => {
    render(<EditorState />)
    expect((screen.getByLabelText('Category') as HTMLSelectElement).value).toBe('category-1')
    expect(screen.getByText('Line total: 300')).toBeDefined()
  })

  it('identifies invalid quantity and unit cost before save', () => {
    render(<EditorState />)
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1.2345' } })
    expect(screen.getByText('Quantity must have at most three decimal places')).toBeDefined()
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Unit cost (minor units)'), { target: { value: '-1' } })
    expect(screen.getByText('Money minor amount must be a non-negative safe integer')).toBeDefined()
  })
})
