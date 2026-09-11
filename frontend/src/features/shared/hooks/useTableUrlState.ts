import { useSearchParams } from 'react-router-dom'

export function useTableUrlState() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const sort = params.get('sortBy') ?? params.get('sort') ?? ''
  const sortDir = params.get('sortDir') ?? 'desc'
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const pageSize = Math.max(1, Number(params.get('pageSize') ?? '20') || 20)
  const filters = Object.fromEntries(Array.from(params.entries()).filter(([key]) => !['search', 'sort', 'sortBy', 'sortDir', 'page', 'pageSize'].includes(key)))
  const update = (changes: { search?: string; sort?: string; sortBy?: string; sortDir?: string; page?: number; pageSize?: number; filters?: Record<string, string> }) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).filter(([key]) => key !== 'filters').forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, String(value))
    })
    if (changes.filters) Object.entries(changes.filters).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    if (changes.search !== undefined || changes.sort !== undefined || changes.pageSize !== undefined) next.set('page', '1')
    setParams(next)
  }
  return { search, sort, sortDir, page, pageSize, filters, update }
}
