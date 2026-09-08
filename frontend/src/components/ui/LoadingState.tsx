import { Spinner } from './Spinner'

export interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Yükleniyor' }: LoadingStateProps) {
  return <div className="flex min-h-32 items-center justify-center rounded-md bg-gray-50"><Spinner label={label} size="lg" /></div>
}
