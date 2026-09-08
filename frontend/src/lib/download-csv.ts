import { downloadBlob } from './download-blob'

export function downloadCsv(csv: string, filename = 'rapor.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, filename)
}
