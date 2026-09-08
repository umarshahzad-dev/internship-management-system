import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv } from './download-csv'

describe('downloadCsv', () => {
  afterEach(() => vi.restoreAllMocks())

  it('creates a CSV blob and downloads it with the requested filename', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    downloadCsv('name,email\nAyşe,ayse@example.com', 'users.csv')

    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'text/csv;charset=utf-8' }))
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})
