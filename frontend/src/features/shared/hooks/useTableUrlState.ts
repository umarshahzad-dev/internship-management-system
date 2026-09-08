import { useSearchParams } from 'react-router-dom'

export function useTableUrlState() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const sort = params.get('sort') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const pageSize = Math.max(1, Number(params.get('pageSize') ?? '10') || 10)
  const update = (changes: { search?: string; sort?: string; page?: number; pageSize?: number }) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, String(value))
    })
    if (changes.search !== undefined || changes.sort !== undefined || changes.pageSize !== undefined) next.set('page', '1')
    setParams(next)
  }
  return { search, sort, page, pageSize, update }
}
