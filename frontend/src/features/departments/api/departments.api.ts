import { api, unwrapPaginated } from '../../../lib/api'
export interface DepartmentOption { id: string; name: string; facultyName?: string }
export async function fetchDepartments() { return unwrapPaginated((await api.get<DepartmentOption[] | { items: DepartmentOption[] }>('/departments', { params: { page: 1, pageSize: 100 } })).data) }
