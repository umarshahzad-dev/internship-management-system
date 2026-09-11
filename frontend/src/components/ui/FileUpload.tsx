import { FileUp } from 'lucide-react'
import { useId, useState, type ChangeEvent, type DragEvent } from 'react'

export interface FileUploadProps {
  label: string
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  error?: string
  className?: string
  hint?: string
}

export function FileUpload({ label, onFilesSelected, accept, multiple = false, disabled = false, error, className, hint }: FileUploadProps) {
  const inputId = useId()
  const [fileNames, setFileNames] = useState<string[]>([])
  const descriptionId = `${inputId}-description`
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setFileNames(files.map((file) => file.name))
    onFilesSelected(files)
  }
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (disabled) return
    const files = Array.from(event.dataTransfer.files ?? [])
    setFileNames(files.map((file) => file.name))
    onFilesSelected(multiple ? files : files.slice(0, 1))
  }

  return (
    <div className={`w-full ${className ?? ''}`}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <label
        htmlFor={inputId}
        className={`mt-1 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition hover:border-navy hover:bg-white focus-within:ring-2 focus-within:ring-navy ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <FileUp aria-hidden="true" className="h-6 w-6 text-navy" />
        <span className="mt-2 text-sm font-medium text-navy">Dosya seçin</span>
        <span className="mt-1 text-xs text-gray-500">{hint ?? (accept?.includes('csv') ? 'CSV dosyası seçin (maks. 5 MB)' : 'PDF veya desteklenen belge yükleyin')}</span>
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          aria-label={label}
          aria-describedby={error ? descriptionId : undefined}
        />
      </label>
      {fileNames.length > 0 ? <ul className="mt-2 space-y-1 text-sm text-gray-700">{fileNames.map((name) => <li key={name}>{name}</li>)}</ul> : null}
      {error ? <p id={descriptionId} className="mt-1 text-sm text-red">{error}</p> : null}
    </div>
  )
}
