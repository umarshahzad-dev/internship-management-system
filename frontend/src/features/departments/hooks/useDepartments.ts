import { useQuery } from '@tanstack/react-query'
import { fetchDepartments } from '../api/departments.api'
export function useDepartments() { return useQuery({ queryKey: ['departments', 'options'], queryFn: fetchDepartments, staleTime: 5 * 60_000 }) }
