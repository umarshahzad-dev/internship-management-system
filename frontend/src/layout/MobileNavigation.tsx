import {
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Gauge,
  Landmark,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
  Megaphone,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { UserRole } from '../features/auth/auth.types'
import { canAccessRoute, NAVIGATION_ITEMS, type NavigationIcon } from '../routes/route-permissions'
import ktunLogo from '../assets/ktun-logo.png'

const icons: Record<NavigationIcon, ReactNode> = {
  dashboard: <Gauge aria-hidden="true" className="h-4 w-4" />,
  internships: <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />,
  calendar: <CalendarDays aria-hidden="true" className="h-4 w-4" />,
  users: <Users aria-hidden="true" className="h-4 w-4" />,
  departments: <Landmark aria-hidden="true" className="h-4 w-4" />,
  companies: <Landmark aria-hidden="true" className="h-4 w-4" />,
  documents: <FileText aria-hidden="true" className="h-4 w-4" />,
  shield: <ShieldCheck aria-hidden="true" className="h-4 w-4" />,
  settings: <Settings aria-hidden="true" className="h-4 w-4" />,
  announcement: <Megaphone aria-hidden="true" className="h-4 w-4" />,
}

export function MobileNavigation({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const visibleItems = NAVIGATION_ITEMS.filter((item) => canAccessRoute(item.permission, role))

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <button type="button" aria-label="Menüyü aç" onClick={() => setOpen(true)} className="rounded-md p-2 text-navy hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-navy lg:hidden"><Menu aria-hidden="true" className="h-5 w-5" /></button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <div className="absolute inset-0 bg-black/50" />
          <aside role="dialog" aria-modal="true" aria-label="Mobil menü" className="relative flex h-full w-72 max-w-[85vw] flex-col bg-navy text-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-white/15 px-4"><div className="flex items-center gap-3"><img className="h-10 w-10 object-contain" src={ktunLogo} alt="Konya Teknik Üniversitesi" /><span className="text-sm font-bold">IMAS</span></div><button ref={closeButtonRef} type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"><X aria-hidden="true" className="h-5 w-5" /></button></div>
            <nav aria-label="Mobil ana menü" className="space-y-1 overflow-y-auto px-3 py-5">{visibleItems.map((item) => <NavLink key={item.href} to={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/85 hover:bg-white/10">{icons[item.icon]}<span>{role === 'STUDENT' && item.studentLabel ? item.studentLabel : item.label}</span></NavLink>)}</nav>
          </aside>
        </div>
      ) : null}
    </>
  )
}
