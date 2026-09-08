import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Select } from '../../../components/ui'
import { api } from '../../../lib/api'
import { queryKeys } from '../../../lib/query-keys'
import { useAdminDepartment } from '../../departments/department-context'

export function DepartmentSelector() {
  const { departmentId, setDepartmentId } = useAdminDepartment()
  const departments = useQuery({ queryKey: queryKeys.departments.all, queryFn: async () => (await api.get<Array<{ id: string; name: string }>>('/departments')).data })
  useEffect(() => {
    const firstDepartment = departments.data?.[0]
    if (!departmentId && firstDepartment) setDepartmentId(firstDepartment.id)
  }, [departmentId, departments.data, setDepartmentId])
  return <div className="min-w-48"><Select label="Bölüm kapsamı" value={departmentId ?? ''} onChange={(event) => setDepartmentId(event.target.value || null)} options={(departments.data ?? []).map((department) => ({ value: department.id, label: department.name }))} placeholder="Tüm bölümler" /></div>
}
