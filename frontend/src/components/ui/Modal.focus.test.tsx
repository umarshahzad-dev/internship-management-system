import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Modal } from './Modal'

function Harness() {
  const [value, setValue] = useState('')
  return <Modal open title="Test" onClose={() => undefined}><input aria-label="Değer" value={value} onChange={(event) => setValue(event.target.value)} /></Modal>
}

describe('Modal focus stability', () => {
  it('keeps focus in a controlled input while typing', () => {
    render(<Harness />)
    const input = screen.getByRole('textbox', { name: 'Değer' })
    input.focus()
    fireEvent.change(input, { target: { value: 'A' } })
    expect(document.activeElement).toBe(input)
  })
})
