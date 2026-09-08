const storageKey = 'imas.department-scope'

export function getDepartmentScope(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(storageKey)
}

export function setDepartmentScope(departmentId: string | null): void {
  if (typeof window === 'undefined') return
  if (departmentId) window.sessionStorage.setItem(storageKey, departmentId)
  else window.sessionStorage.removeItem(storageKey)
}
