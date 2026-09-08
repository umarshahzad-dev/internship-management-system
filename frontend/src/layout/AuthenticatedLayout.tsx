import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Gauge,
  Landmark,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { UserRole } from '../features/auth/auth.types'
import { canAccessRoute, NAVIGATION_ITEMS, type NavigationIcon } from '../routes/route-permissions'
import { MobileNavigation } from './MobileNavigation'
import { DepartmentSelector } from '../features/admin/components/DepartmentSelector'

const icons: Record<NavigationIcon, ReactNode> = {
  dashboard: <Gauge aria-hidden="true" className="h-4 w-4" />, internships: <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />, calendar: <CalendarDays aria-hidden="true" className="h-4 w-4" />, users: <Users aria-hidden="true" className="h-4 w-4" />, departments: <Landmark aria-hidden="true" className="h-4 w-4" />, companies: <Landmark aria-hidden="true" className="h-4 w-4" />, documents: <FileText aria-hidden="true" className="h-4 w-4" />, shield: <ShieldCheck aria-hidden="true" className="h-4 w-4" />, settings: <Settings aria-hidden="true" className="h-4 w-4" />,
}

const roleLabels: Record<UserRole, string> = {
  STUDENT: 'Öğrenci',
  ACADEMIC: 'Akademik personel',
  ADMINISTRATIVE: 'İdari personel',
  ADMIN: 'Sistem yöneticisi',
}


export interface AuthenticatedLayoutProps { role: UserRole }

export function AuthenticatedLayout({ role }: AuthenticatedLayoutProps) {
  const navigate = useNavigate()
  const navigation = NAVIGATION_ITEMS.filter((item) => canAccessRoute(item.permission, role))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy text-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/15 px-5"><div className="grid h-9 w-8 place-items-center bg-red text-[9px] font-bold tracking-tight">KTÜN</div><div className="leading-tight"><p className="text-sm font-bold">IMAS</p><p className="text-[10px] text-white/60">Staj yönetim sistemi</p></div></div>
        <nav aria-label="Ana menü" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navigation.map((item) => <NavLink key={item.href} to={item.href} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${isActive ? 'bg-white text-navy shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>{icons[item.icon]}<span>{role === 'STUDENT' && item.studentLabel ? item.studentLabel : item.label}</span></NavLink>)}
        </nav>
        <div className="border-t border-white/15 p-4"><p className="truncate text-xs font-semibold">Konya Teknik Üniversitesi</p><p className="mt-1 text-[11px] text-white/60">{roleLabels[role]}</p></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6"><div className="flex items-center gap-3"><MobileNavigation role={role} /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-red">IMAS</p><p className="text-sm font-semibold text-navy">Staj yönetim sistemi</p></div></div><div className="flex items-center gap-3">{role === 'ADMIN' ? <DepartmentSelector /> : null}<span className="hidden text-sm text-gray-500 sm:inline">{roleLabels[role]}</span><button type="button" onClick={() => navigate('/login', { replace: true })} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-navy transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy"><LogOut aria-hidden="true" className="h-4 w-4" />Oturumu kapat</button></div></header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
